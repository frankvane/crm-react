import { Button, InputNumber, Progress, Upload, message } from "antd";
import {
  CaretRightOutlined,
  PauseOutlined,
  StopOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import React, { useRef, useState } from "react";
import {
  calcFileMD5WithWorker,
  calcProgress,
  createFileChunks,
  uploadChunkWithRetry,
} from "./utils";

import async from "async";
import request from "@/utils/request";
import useNetwork from "ahooks/lib/useNetwork";

interface Chunk {
  index: number;
  start: number;
  end: number;
  chunk: Blob;
}

const FileUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [concurrent, setConcurrent] = useState(3);
  const [chunkSize, setChunkSize] = useState(5 * 1024 * 1024);
  const [md5, setMd5] = useState<string>("");
  const [totalChunks, setTotalChunks] = useState(0);
  const [uploadingChunks, setUploadingChunks] = useState(0);
  const queueRef = useRef<any>(null);
  const network = useNetwork();

  // 动态调整chunkSize和并发数
  React.useEffect(() => {
    if (network.online) {
      if (network.type === "wifi") {
        setChunkSize(10 * 1024 * 1024);
        setConcurrent(5);
      } else if (network.type === "cellular") {
        setChunkSize(2 * 1024 * 1024);
        setConcurrent(2);
      } else {
        setChunkSize(5 * 1024 * 1024);
        setConcurrent(3);
      }
    }
  }, [network]);

  // 选文件
  const handleBeforeUpload = (file: File) => {
    setFile(file);
    setProgress(0);
    setMd5("");
    return false;
  };

  // 秒传确认、断点续传、切片、上传主流程
  const handleStart = async () => {
    if (!file) return;
    setUploading(true);
    setPaused(false);
    message.loading({ content: "正在计算MD5...", key: "md5" });
    // 1. 计算MD5
    let fileMd5 = md5;
    if (!fileMd5) {
      fileMd5 = await calcFileMD5WithWorker(file);
      setMd5(fileMd5);
    }
    // 生成 file_id
    const fileId = `${fileMd5}-${file.name}-${file.size}`;
    message.success({ content: `MD5: ${fileMd5}`, key: "md5", duration: 1 });
    // 2. 秒传确认
    const checkRes = await request.post("/fileUpload/check", {
      file_id: fileId,
      md5: fileMd5,
      name: file.name,
      size: file.size,
    });
    if (checkRes?.data?.uploaded) {
      setProgress(100);
      setUploading(false);
      message.success("文件已秒传，无需重复上传");
      return;
    }
    // 3. 查询已上传分片
    const uploadedRes = await request.get("/fileUpload/uploadedChunks", {
      params: { file_id: fileId, md5: fileMd5 },
    });
    const uploadedList: number[] = uploadedRes?.data?.chunks || [];
    // 4. 切片
    const chunks: Chunk[] = createFileChunks(file, chunkSize);
    setTotalChunks(chunks.length);
    // 5. 并发上传
    let finished = uploadedList.length;
    setProgress(calcProgress(finished, chunks.length));
    setUploadingChunks(finished);
    // async queue
    queueRef.current = async.queue(async (chunk: Chunk, cb) => {
      if (paused) return cb();
      if (uploadedList.includes(chunk.index)) return cb();
      try {
        await uploadChunkWithRetry(
          {
            file_id: fileId,
            md5: fileMd5,
            index: chunk.index,
            chunk: chunk.chunk,
            name: file.name,
            total: chunks.length,
          },
          async (data) => {
            const formData = new FormData();
            formData.append("file_id", data.file_id);
            formData.append("md5", data.md5);
            formData.append("index", String(data.index));
            formData.append("chunk", data.chunk);
            formData.append("name", data.name);
            formData.append("total", String(data.total));
            return request.post("/fileUpload/uploadChunk", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }
        );
        finished++;
        setUploadingChunks(finished);
        setProgress(calcProgress(finished, chunks.length));
        if (finished === chunks.length) {
          // 6. 合并
          await request.post("/fileUpload/merge", {
            file_id: fileId,
            md5: fileMd5,
            name: file.name,
            size: file.size,
            total: chunks.length,
          });
          setProgress(100);
          setUploading(false);
          message.success("上传完成并合并成功");
        }
      } catch (e: any) {
        message.error(`分片${chunk.index}上传失败: ${e.message}`);
        setUploading(false);
      }
      cb();
    }, concurrent);
    // 启动队列
    queueRef.current.push(
      chunks.filter((c) => !uploadedList.includes(c.index))
    );
  };

  // 暂停
  const handlePause = () => {
    setPaused(true);
    if (queueRef.current) queueRef.current.pause();
  };

  // 恢复
  const handleResume = () => {
    setPaused(false);
    if (queueRef.current) queueRef.current.resume();
  };

  // 中断
  const handleStop = () => {
    setUploading(false);
    setPaused(false);
    setProgress(0);
    setFile(null);
    setMd5("");
    setTotalChunks(0);
    setUploadingChunks(0);
    if (queueRef.current) queueRef.current.kill();
  };

  return (
    <div>
      <Upload
        beforeUpload={handleBeforeUpload}
        showUploadList={false}
        disabled={uploading}
      >
        <Button icon={<UploadOutlined />}>选择文件</Button>
      </Upload>
      <div style={{ margin: "12px 0" }}>
        <span>切片大小(字节): </span>
        <InputNumber
          min={1024 * 1024}
          max={100 * 1024 * 1024}
          step={1024 * 1024}
          value={chunkSize}
          onChange={(v) => setChunkSize(Number(v))}
          disabled={uploading}
        />
        <span style={{ marginLeft: 16 }}>并发数: </span>
        <InputNumber
          min={1}
          max={10}
          value={concurrent}
          onChange={(v) => setConcurrent(Number(v))}
          disabled={uploading}
        />
      </div>
      {file && (
        <div style={{ marginTop: 16 }}>
          <div>{file.name}</div>
          <Progress percent={progress} />
          <div style={{ marginTop: 8 }}>
            {!uploading && (
              <Button
                type="primary"
                onClick={handleStart}
                icon={<CaretRightOutlined />}
              >
                开始上传
              </Button>
            )}
            {uploading && !paused && (
              <Button onClick={handlePause} icon={<PauseOutlined />}>
                暂停
              </Button>
            )}
            {uploading && paused && (
              <Button
                type="primary"
                onClick={handleResume}
                icon={<CaretRightOutlined />}
              >
                恢复
              </Button>
            )}
            {uploading && (
              <Button danger onClick={handleStop} icon={<StopOutlined />}>
                中断上传
              </Button>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <span>
              {uploadingChunks}/{totalChunks} 分片已上传
            </span>
            {md5 && <span style={{ marginLeft: 16 }}>MD5: {md5}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
