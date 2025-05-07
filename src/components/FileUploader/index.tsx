import { Button, InputNumber, Modal, Progress, Upload, message } from "antd";
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

const LOCAL_KEY_PREFIX = "fileUploader_progress_";

const FileUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [concurrent, setConcurrent] = useState(3);
  const [chunkSize, setChunkSize] = useState(1 * 1024 * 1024);
  const [md5, setMd5] = useState<string>("");
  const [totalChunks, setTotalChunks] = useState(0);
  const [uploadingChunks, setUploadingChunks] = useState(0);
  const queueRef = useRef<any>(null);
  const network = useNetwork();
  const controllersRef = useRef<AbortController[]>([]);
  const stoppedRef = useRef(false);
  const [resumeTask, setResumeTask] = useState<any>(null);
  const [showResume, setShowResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resumeTaskList, setResumeTaskList] = useState<any[]>([]);

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
        setChunkSize(1 * 1024 * 1024);
        setConcurrent(3);
      }
    }
  }, [network]);

  // 页面加载时收集所有断点任务
  React.useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith(LOCAL_KEY_PREFIX)
    );
    const tasks = keys
      .map((k) => {
        try {
          return JSON.parse(localStorage.getItem(k)!);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    setResumeTaskList(tasks);
  }, []);

  // 恢复上传时文件选择
  const handleResumeFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || !resumeTask) return;
    const selectedFile = files[0];
    // 校验文件名、大小
    if (
      selectedFile.name !== resumeTask.name ||
      selectedFile.size !== resumeTask.size
    ) {
      message.error("所选文件与未完成任务不一致，请选择正确的原文件");
      return;
    }
    // 计算md5校验
    message.loading({ content: "正在校验文件MD5...", key: "md5-check" });
    const md5 = await calcFileMD5WithWorker(selectedFile);
    if (md5 !== resumeTask.md5) {
      message.error("文件MD5校验失败，请选择正确的原文件");
      return;
    }
    message.success({
      content: "校验通过，恢复上传",
      key: "md5-check",
      duration: 1,
    });
    setFile(selectedFile);
    setMd5(md5);
    setTotalChunks(resumeTask.totalChunks || 0);
    setUploadingChunks(resumeTask.uploadedList?.length || 0);
    setProgress(
      calcProgress(
        resumeTask.uploadedList?.length || 0,
        resumeTask.totalChunks || 1
      )
    );
    setShowResume(false);
    setTimeout(() => handleStart(), 300);
  };

  // 选文件
  const handleBeforeUpload = (file: File) => {
    setFile(file);
    setProgress(0);
    setMd5("");
    return false;
  };

  // 重置所有状态
  const reset = () => {
    setUploading(false);
    setPaused(false);
    setProgress(0);
    // 不再清理 localStorage，断点信息保留
    setFile(null);
    setMd5("");
    setTotalChunks(0);
    setUploadingChunks(0);
    if (queueRef.current) queueRef.current.kill();
    controllersRef.current.forEach((c) => c.abort());
    controllersRef.current = [];
  };

  // 原子写入+重试，确保 uploadedList 不丢分片
  function atomicUpdateUploadedList(
    fileId: string,
    chunkIndex: number,
    fileMd5: string,
    file: File,
    totalChunks: number
  ) {
    let uploadedListLocal: number[] = [];
    const local = localStorage.getItem(LOCAL_KEY_PREFIX + fileId);
    if (local) {
      uploadedListLocal = JSON.parse(local).uploadedList || [];
    }
    const newList = Array.from(new Set([...uploadedListLocal, chunkIndex]));
    const newObj = {
      fileId,
      md5: fileMd5,
      name: file?.name,
      size: file?.size,
      totalChunks,
      uploadedList: newList,
    };
    const newStr = JSON.stringify(newObj);
    try {
      localStorage.setItem(LOCAL_KEY_PREFIX + fileId, newStr);
    } catch (err) {
      console.error("[atomicUpdateUploadedList] localStorage 写入失败:", err);
    }
  }

  // 秒传确认、断点续传、切片、上传主流程
  const handleStart = async () => {
    if (!file) return;
    stoppedRef.current = false;
    setUploading(true);
    setPaused(false);
    controllersRef.current = [];
    message.loading({ content: "正在计算MD5...", key: "md5" });
    let fileMd5 = md5;
    if (!fileMd5) {
      fileMd5 = await calcFileMD5WithWorker(file);
      setMd5(fileMd5);
    }
    const fileId = `${fileMd5}-${file.name}-${file.size}`;
    message.success({ content: `MD5: ${fileMd5}`, key: "md5", duration: 1 });
    // 优先用本地断点信息
    let uploadedList: number[] = [];
    const local = localStorage.getItem(LOCAL_KEY_PREFIX + fileId);
    if (local) {
      uploadedList = JSON.parse(local).uploadedList || [];
    } else {
      // fallback: 查询服务端
      const uploadedRes = await request.get("/file/status", {
        params: { file_id: fileId, md5: fileMd5 },
      });
      uploadedList = uploadedRes?.data?.chunks || [];
    }
    const chunks: Chunk[] = createFileChunks(file, chunkSize);
    setTotalChunks(chunks.length);
    let finished = uploadedList.length;
    setProgress(calcProgress(finished, chunks.length));
    setUploadingChunks(finished);
    const pendingChunks = chunks.filter((c) => !uploadedList.includes(c.index));
    // --- async.queue ---
    queueRef.current = async.queue((chunk: Chunk, cb) => {
      if (paused || stoppedRef.current) return cb();
      uploadChunkWithRetry(
        {
          file_id: fileId,
          md5: fileMd5,
          index: chunk.index,
          chunk: chunk.chunk,
          name: file.name,
          total: chunks.length,
        },
        (data) => {
          const formData = new FormData();
          formData.append("file_id", data.file_id);
          formData.append("md5", data.md5);
          formData.append("index", String(data.index));
          formData.append("chunk", data.chunk);
          formData.append("name", data.name);
          formData.append("total", String(data.total));
          const controller = new AbortController();
          controllersRef.current.push(controller);
          return request.post("/file/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            signal: controller.signal,
          });
        }
      )
        .then(() => {
          finished++;
          setUploadingChunks(finished);
          setProgress(calcProgress(finished, chunks.length));
          atomicUpdateUploadedList(
            fileId,
            chunk.index,
            fileMd5,
            file,
            chunks.length
          );
          cb();
        })
        .catch((e: any) => {
          message.error(`分片${chunk.index}上传失败: ${e.message}`);
          setUploading(false);
          cb(e);
        });
    }, concurrent);
    queueRef.current.drain(() => {
      if (!stoppedRef.current && !paused) {
        request
          .post("/file/merge", {
            file_id: fileId,
            md5: fileMd5,
            name: file.name,
            size: file.size,
            total: chunks.length,
          })
          .then(() => {
            setProgress(100);
            setUploading(false);
            message.success("上传完成并合并成功");
            setTimeout(reset, 1000);
            // 只在此处清理本地断点信息
            localStorage.removeItem(LOCAL_KEY_PREFIX + fileId);
          });
      }
    });
    queueRef.current.push(pendingChunks);
  };

  // 暂停
  const handlePause = () => {
    setPaused(true);
    if (queueRef.current) queueRef.current.pause();
    controllersRef.current.forEach((c) => c.abort());
    controllersRef.current = [];
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
    stoppedRef.current = true;
    if (queueRef.current) queueRef.current.kill();
    controllersRef.current.forEach((c) => c.abort());
    controllersRef.current = [];
    reset(); // 不再 removeItem
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
      <Button
        style={{ marginLeft: 8 }}
        onClick={() => {
          if (resumeTaskList.length === 0) {
            message.info("暂无可恢复的上传任务");
            return;
          }
          // 如果只有一个任务，直接弹窗；多个任务可扩展为弹窗列表
          setResumeTask(resumeTaskList[0]);
          setShowResume(true);
        }}
        disabled={uploading}
      >
        恢复上传
      </Button>
      <div style={{ margin: "12px 0" }}>
        <span>切片大小(MB): </span>
        <InputNumber
          min={1}
          max={100}
          step={1}
          value={chunkSize / 1024 / 1024}
          onChange={(v) => setChunkSize(Number(v) * 1024 * 1024)}
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
          <div>文件大小：{(file.size / 1024 / 1024).toFixed(2)} MB</div>
          <Progress percent={progress} />
          <div style={{ marginTop: 8 }}>
            {!uploading && (
              <Button
                type="primary"
                onClick={() => handleStart()}
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
      {showResume && resumeTask && (
        <Modal
          open={showResume}
          title="恢复未完成的上传任务"
          onCancel={() => {
            setShowResume(false);
          }}
          footer={null}
          maskClosable={false}
        >
          <div style={{ marginBottom: 16 }}>
            文件：{resumeTask.name}
            <br />
            大小：{(resumeTask.size / 1024 / 1024).toFixed(2)} MB
          </div>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              选择原文件恢复上传
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleResumeFileChange}
            />
          </div>
          <Button
            danger
            onClick={() => {
              setShowResume(false);
              localStorage.removeItem(LOCAL_KEY_PREFIX + resumeTask.fileId);
              window.location.reload();
            }}
          >
            删除任务
          </Button>
        </Modal>
      )}
    </div>
  );
};

export default FileUploader;
