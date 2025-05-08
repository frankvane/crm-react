import {
  Button,
  List,
  Modal,
  Progress,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
  calcFileMD5WithWorker,
  checkFileBeforeUpload,
  createFileChunks,
} from "./utils";

import { UploadOutlined } from "@ant-design/icons";
import { useNetworkType } from "./hooks/useNetworkType";

const API_PREFIX = "http://localhost:3000/api";

// 秒传验证API（需后端接口支持）
async function checkInstantUpload({
  fileId,
  md5,
  name,
  size,
  total,
  chunkMD5s,
}: {
  fileId: string;
  md5: string;
  name: string;
  size: number;
  total: number;
  chunkMD5s: string[];
}): Promise<{
  uploaded: boolean;
  chunkCheckResult: Array<{ index: number; exist: boolean; match: boolean }>;
}> {
  const res = await fetch(`${API_PREFIX}/file/instant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_id: fileId,
      md5,
      name,
      size,
      total,
      chunk_md5s: chunkMD5s,
    }),
  });
  const data = await res.json();
  if (data.code !== 200) throw new Error(data.message || "秒传接口异常");
  return data.data || { uploaded: false, chunkCheckResult: [] };
}

// 获取已上传分片
async function getFileStatus({ fileId, md5 }: { fileId: string; md5: string }) {
  const res = await fetch(
    `${API_PREFIX}/file/status?file_id=${encodeURIComponent(fileId)}&md5=${md5}`
  );
  const data = await res.json();
  if (data.code !== 200) throw new Error(data.message || "状态检测失败");
  return data.data?.chunks || [];
}

// 上传单个分片
async function uploadFileChunk({
  fileId,
  md5,
  index,
  chunk,
  name,
  total,
}: {
  fileId: string;
  md5: string;
  index: number;
  chunk: Blob;
  name: string;
  total: number;
}) {
  const formData = new FormData();
  formData.append("file_id", fileId);
  formData.append("md5", md5);
  formData.append("index", String(index));
  formData.append("chunk", chunk);
  formData.append("name", name);
  formData.append("total", String(total));
  const res = await fetch(`${API_PREFIX}/file/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (data.code !== 200) throw new Error(data.message || "分片上传失败");
  return data;
}

// 合并分片
async function mergeFile({
  fileId,
  md5,
  name,
  size,
  total,
}: {
  fileId: string;
  md5: string;
  name: string;
  size: number;
  total: number;
}) {
  const res = await fetch(`${API_PREFIX}/file/merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId, md5, name, size, total }),
  });
  const data = await res.json();
  if (data.code !== 200) throw new Error(data.message || "合并失败");
  return data;
}

interface FileUploaderProps {
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
}

const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_CONCURRENT_UPLOAD = 3; // 最大并发文件数
const SPEED_WINDOW = 5; // 速率滑动窗口，单位：分片

const FileUploader: React.FC<FileUploaderProps> = ({
  accept = "*",
  maxSizeMB = 2048,
  multiple = true,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [md5Info, setMd5Info] = useState<
    Record<string, { fileMD5: string; chunkMD5s: string[] }>
  >({});
  const [instantInfo, setInstantInfo] = useState<
    Record<string, { uploaded: boolean; chunkCheckResult: any[] }>
  >({});
  const [uploadingInfo, setUploadingInfo] = useState<
    Record<string, { progress: number; status: string }>
  >({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [uploadingAll, setUploadingAll] = useState(false);
  const [speedInfo, setSpeedInfo] = useState<
    Record<string, { speed: number; leftTime: number }>
  >({});
  const speedHistoryRef = useRef<
    Record<string, Array<{ time: number; loaded: number }>>
  >({});
  const { networkType, concurrency } = useNetworkType();
  const concurrencyRef = useRef(concurrency);
  const [errorInfo, setErrorInfo] = useState<Record<string, string>>({});

  // beforeUpload 校验
  const handleBeforeUpload = (file: File) => {
    const ok = checkFileBeforeUpload({
      file,
      accept,
      maxSizeMB,
      onError: (msg) => message.error(msg),
    });
    if (!ok) return Upload.LIST_IGNORE;
    setFiles((prev) => {
      if (prev.find((f) => f.name === file.name && f.size === file.size))
        return prev;
      return [...prev, file];
    });
    return false; // 阻止自动上传
  };

  // 计算MD5并秒传验证
  const handleCalcMD5 = async (file: File) => {
    setLoadingKey(file.name + file.size);
    try {
      const result = await calcFileMD5WithWorker(file, DEFAULT_CHUNK_SIZE);
      setMd5Info((prev) => ({ ...prev, [file.name + file.size]: result }));
      message.success(`MD5计算完成: ${result.fileMD5}`);
      // 秒传验证
      const fileId = `${result.fileMD5}-${file.name}-${file.size}`;
      const chunks = createFileChunks(file, DEFAULT_CHUNK_SIZE);
      const instantRes = await checkInstantUpload({
        fileId,
        md5: result.fileMD5,
        name: file.name,
        size: file.size,
        total: chunks.length,
        chunkMD5s: result.chunkMD5s,
      });
      setInstantInfo((prev) => ({
        ...prev,
        [file.name + file.size]: instantRes,
      }));
      if (instantRes.uploaded) {
        message.success("[秒传] 文件已存在，无需上传");
      } else {
        const needUpload = instantRes.chunkCheckResult.filter(
          (c: any) => !c.exist || !c.match
        ).length;
        message.info(`[秒传] 需上传分片数: ${needUpload}`);
      }
    } catch {
      message.error("MD5或秒传接口异常");
    } finally {
      setLoadingKey(null);
    }
  };

  // 找到所有未计算MD5的文件，依次自动计算
  useEffect(() => {
    const unMd5Files = files.filter((f) => !md5Info[f.name + f.size]);
    if (unMd5Files.length > 0 && !loadingKey) {
      (async () => {
        for (const file of unMd5Files) {
          await handleCalcMD5(file);
        }
      })();
    }
  }, [files, md5Info, loadingKey]);

  // 分片上传主流程（带本地进度存储）
  const handleStartUpload = async (file: File, resumeInfo?: any) => {
    const key = file.name + file.size;
    setErrorInfo((prev) => ({ ...prev, [key]: "" }));
    const md5 = md5Info[key]?.fileMD5 || resumeInfo?.md5;
    if (!md5) {
      message.error("请先计算MD5");
      return;
    }
    const fileId = `${md5}-${file.name}-${file.size}`;
    let uploadedChunks: number[] = resumeInfo?.uploadedChunks || [];
    if (!resumeInfo) {
      try {
        uploadedChunks = await getFileStatus({ fileId, md5 });
      } catch {
        /* 忽略异常 */
      }
    }
    const needUploadChunks = createFileChunks(file, DEFAULT_CHUNK_SIZE).filter(
      (c) => !uploadedChunks.includes(c.index)
    );
    let uploadedCount = uploadedChunks.length;
    let uploadedBytes = uploadedChunks.reduce(
      (sum, idx) =>
        sum +
        (createFileChunks(file, DEFAULT_CHUNK_SIZE)[idx]?.end -
          createFileChunks(file, DEFAULT_CHUNK_SIZE)[idx]?.start),
      0
    );
    setUploadingInfo((prev) => ({
      ...prev,
      [key]: {
        progress: Math.round(
          (uploadedCount / createFileChunks(file, DEFAULT_CHUNK_SIZE).length) *
            100
        ),
        status: "uploading",
      },
    }));
    speedHistoryRef.current[key] = [
      { time: Date.now(), loaded: uploadedBytes },
    ];
    for (const chunk of needUploadChunks) {
      let retry = 0;
      let delay = 500;
      const chunkSize = chunk.end - chunk.start;
      while (retry < 5) {
        try {
          await uploadFileChunk({
            fileId,
            md5,
            index: chunk.index,
            chunk: chunk.chunk,
            name: file.name,
            total: createFileChunks(file, DEFAULT_CHUNK_SIZE).length,
          });
          uploadedCount++;
          uploadedBytes += chunkSize;
          uploadedChunks.push(chunk.index);
          setUploadingInfo((prev) => ({
            ...prev,
            [key]: {
              progress: Math.round(
                (uploadedCount /
                  createFileChunks(file, DEFAULT_CHUNK_SIZE).length) *
                  100
              ),
              status: "uploading",
            },
          }));
          const now = Date.now();
          const history = speedHistoryRef.current[key] || [];
          history.push({ time: now, loaded: uploadedBytes });
          if (history.length > SPEED_WINDOW) history.shift();
          speedHistoryRef.current[key] = history;
          if (history.length >= 2) {
            const first = history[0];
            const last = history[history.length - 1];
            const speed =
              (last.loaded - first.loaded) / ((last.time - first.time) / 1000); // B/s
            const leftBytes = file.size - last.loaded;
            const leftTime = speed > 0 ? leftBytes / speed : 0;
            setSpeedInfo((prev) => ({
              ...prev,
              [key]: {
                speed,
                leftTime,
              },
            }));
          }
          break;
        } catch (err: any) {
          retry++;
          if (retry >= 5) {
            setUploadingInfo((prev) => ({
              ...prev,
              [key]: {
                progress: Math.round(
                  (uploadedCount /
                    createFileChunks(file, DEFAULT_CHUNK_SIZE).length) *
                    100
                ),
                status: "error",
              },
            }));
            setErrorInfo((prev) => ({
              ...prev,
              [key]: err?.message || "分片上传失败",
            }));
            message.error(`分片${chunk.index}上传失败`);
            return;
          }
          await new Promise((res) => setTimeout(res, delay));
          delay = Math.min(delay * 2, 5000);
        }
      }
    }
    try {
      await mergeFile({
        fileId,
        md5,
        name: file.name,
        size: file.size,
        total: createFileChunks(file, DEFAULT_CHUNK_SIZE).length,
      });
      setUploadingInfo((prev) => ({
        ...prev,
        [key]: { progress: 100, status: "done" },
      }));
      setSpeedInfo((prev) => ({ ...prev, [key]: { speed: 0, leftTime: 0 } }));
      setErrorInfo((prev) => ({ ...prev, [key]: "" }));
      message.success("上传并合并完成");
    } catch (err: any) {
      setUploadingInfo((prev) => ({
        ...prev,
        [key]: { progress: 100, status: "merge-error" },
      }));
      setErrorInfo((prev) => ({
        ...prev,
        [key]: err?.message || "合并失败",
      }));
      Modal.error({
        title: "合并失败",
        content: err?.message || "合并失败",
      });
      message.error("合并失败");
    }
  };

  // 重试单个文件
  const handleRetry = (file: File) => {
    handleStartUpload(file);
  };

  // 重试所有失败文件
  const handleRetryAllFailed = async () => {
    const failedFiles = files.filter((file) => {
      const key = file.name + file.size;
      const uploading = uploadingInfo[key];
      return (
        uploading &&
        (uploading.status === "error" || uploading.status === "merge-error")
      );
    });
    for (const file of failedFiles) {
      await handleStartUpload(file);
    }
    message.success("所有失败文件已重试");
  };

  // 批量上传自动补齐MD5
  const handleStartAll = async () => {
    setUploadingAll(true);
    // 先为所有未计算MD5的文件自动计算MD5
    for (const file of files) {
      const key = file.name + file.size;
      if (!md5Info[key]) {
        await handleCalcMD5(file);
      }
    }
    // 过滤出未秒传且未上传完成的文件
    const needUploadFiles = files.filter((file) => {
      const key = file.name + file.size;
      const instant = instantInfo[key];
      const uploading = uploadingInfo[key];
      return (
        md5Info[key] &&
        !instant?.uploaded &&
        (!uploading || uploading.status !== "done")
      );
    });
    // 并发控制
    let idx = 0;
    const queue: Promise<void>[] = [];
    const next = async () => {
      if (idx >= needUploadFiles.length) return;
      const file = needUploadFiles[idx++];
      await handleStartUpload(file);
      await next();
    };
    for (
      let i = 0;
      i < Math.min(MAX_CONCURRENT_UPLOAD, needUploadFiles.length);
      i++
    ) {
      queue.push(next());
    }
    await Promise.all(queue);
    setUploadingAll(false);
    message.success("全部上传任务已完成");
  };

  // 单个文件上传按钮自动补齐MD5
  const handleStartUploadWithAutoMD5 = async (file: File) => {
    const key = file.name + file.size;
    if (!md5Info[key]) {
      await handleCalcMD5(file);
    }
    await handleStartUpload(file);
  };

  // 统计总速率
  const totalSpeed = Object.values(speedInfo).reduce(
    (sum, s) => sum + (s.speed || 0),
    0
  );

  // 是否有失败文件
  const hasFailed = files.some((file) => {
    const key = file.name + file.size;
    const uploading = uploadingInfo[key];
    return (
      uploading &&
      (uploading.status === "error" || uploading.status === "merge-error")
    );
  });

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Tag color="blue">网络类型: {networkType}</Tag>
        <Tag color="purple">并发数: {concurrencyRef.current}</Tag>
        <Tag color="geekblue">
          切片大小: {(DEFAULT_CHUNK_SIZE / 1024 / 1024).toFixed(2)} MB
        </Tag>
        {uploadingAll && (
          <Tag color="magenta">
            总速率: {(totalSpeed / 1024 / 1024).toFixed(2)} MB/s
          </Tag>
        )}
        {hasFailed && (
          <Button
            size="small"
            danger
            style={{ marginLeft: 8 }}
            onClick={handleRetryAllFailed}
          >
            重试失败文件
          </Button>
        )}
      </div>
      <Upload
        beforeUpload={handleBeforeUpload}
        showUploadList={false}
        accept={accept}
        multiple={multiple}
        disabled={uploadingAll}
      >
        <Button icon={<UploadOutlined />}>选择文件</Button>
      </Upload>
      <Button
        type="primary"
        style={{ marginLeft: 8 }}
        onClick={handleStartAll}
        disabled={uploadingAll || files.length === 0}
      >
        {uploadingAll ? "批量上传中..." : "上传全部"}
      </Button>
      <List
        style={{ marginTop: 16 }}
        bordered
        dataSource={files}
        renderItem={(file) => {
          const key = file.name + file.size;
          const md5 = md5Info[key];
          const instant = instantInfo[key];
          const uploading = uploadingInfo[key];
          const speed = speedInfo[key]?.speed || 0;
          const leftTime = speedInfo[key]?.leftTime || 0;
          const error = errorInfo[key];
          return (
            <List.Item>
              <div
                style={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <span style={{ flex: 1, minWidth: 200 }}>{file.name}</span>
                <span style={{ width: 80, textAlign: "right", color: "#888" }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <span
                  style={{ width: 120, textAlign: "center", marginLeft: 8 }}
                >
                  {uploading && uploading.status === "done" ? (
                    <Tag color="green">上传成功</Tag>
                  ) : (
                    <>
                      {instant &&
                        (instant.uploaded ? (
                          <Tag color="green">已秒传</Tag>
                        ) : (
                          <Tag color="orange">
                            需上传分片:{" "}
                            {
                              instant.chunkCheckResult.filter(
                                (c: any) => !c.exist || !c.match
                              ).length
                            }
                          </Tag>
                        ))}
                      {!instant?.uploaded && (
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => handleStartUploadWithAutoMD5(file)}
                          disabled={
                            !md5 ||
                            (uploading && uploading.status === "uploading") ||
                            uploadingAll
                          }
                        >
                          {!md5
                            ? "计算中..."
                            : uploading && uploading.status === "uploading"
                            ? "上传中..."
                            : "开始上传"}
                        </Button>
                      )}
                      {uploading && (
                        <span
                          style={{ display: "inline-block", minWidth: 100 }}
                        >
                          <Tooltip
                            title={
                              uploading.status === "error" ||
                              uploading.status === "merge-error"
                                ? error || "上传失败"
                                : undefined
                            }
                          >
                            <Progress
                              percent={uploading.progress}
                              size="small"
                              status={
                                uploading.status === "error" ||
                                uploading.status === "merge-error"
                                  ? "exception"
                                  : uploading.status === "done"
                                  ? "success"
                                  : undefined
                              }
                              style={{ width: 80 }}
                            />
                          </Tooltip>
                          {uploading.status === "uploading" && speed > 0 && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#888",
                                marginTop: 2,
                              }}
                            >
                              速度: {(speed / 1024 / 1024).toFixed(2)} MB/s
                              {leftTime > 0 && (
                                <span style={{ marginLeft: 8 }}>
                                  剩余: {Math.ceil(leftTime)} 秒
                                </span>
                              )}
                            </div>
                          )}
                          {(uploading.status === "error" ||
                            uploading.status === "merge-error") && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "red",
                                marginTop: 2,
                              }}
                            >
                              {error && (
                                <span style={{ marginRight: 8 }}>{error}</span>
                              )}
                              <Button
                                size="small"
                                danger
                                onClick={() => handleRetry(file)}
                              >
                                重试
                              </Button>
                            </div>
                          )}
                        </span>
                      )}
                    </>
                  )}
                </span>
              </div>
            </List.Item>
          );
        }}
        locale={{ emptyText: "暂无待上传文件" }}
      />
    </div>
  );
};

export default FileUploader;
