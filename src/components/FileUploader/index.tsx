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
  createFileChunks,
  uploadChunkWithRetry,
} from "./utils";

import async from "async";
import request from "@/utils/request";
import useDynamicUploadConfig from "./hooks/useDynamicUploadConfig";

interface Chunk {
  index: number;
  start: number;
  end: number;
  chunk: Blob;
}

const LOCAL_KEY_PREFIX = "fileUploader_progress_";

interface FileUploaderProps {
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept = ".png,.jpg,.jpeg,.gif,.bmp,.webp,image/*",
  maxSizeMB = 10,
  multiple = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileStates, setFileStates] = useState<
    Record<
      string,
      {
        progress: number;
        uploading: boolean;
        paused: boolean;
        md5?: string;
        totalChunks?: number;
        uploadingChunks?: number;
        queue?: any;
        controllers?: AbortController[];
        stopped?: boolean;
      }
    >
  >({});
  const [chunkSize, setChunkSize, concurrent, setConcurrent] =
    useDynamicUploadConfig();
  const [resumeTask, setResumeTask] = useState<any>(null);
  const [showResume, setShowResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resumeTaskList, setResumeTaskList] = useState<any[]>([]);
  const [uploadingAll, setUploadingAll] = useState(false);

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
    setFiles((prev) => {
      if (
        prev.find(
          (f) => f.name === selectedFile.name && f.size === selectedFile.size
        )
      )
        return prev;
      return [...prev, selectedFile];
    });
    setFileStates((prev) => ({
      ...prev,
      [selectedFile.name + selectedFile.size]: {
        progress: 0,
        uploading: false,
        paused: false,
      },
    }));
    setShowResume(false);
    setTimeout(() => handleStart(selectedFile), 300);
  };

  // 新 beforeUpload，支持类型和大小校验
  const handleBeforeUpload = (file: File) => {
    const acceptList = accept.split(",").map((s) => s.trim().toLowerCase());
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    const fileType = file.type.toLowerCase();
    // 类型校验
    const typeOk =
      acceptList.includes("*") ||
      acceptList.includes(fileExt) ||
      (acceptList.includes("image/*") && fileType.startsWith("image/"));
    if (!typeOk) {
      message.error("文件类型不支持");
      return Upload.LIST_IGNORE;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      message.error(`文件不能超过${maxSizeMB}MB`);
      return Upload.LIST_IGNORE;
    }
    setFiles((prev) => {
      if (prev.find((f) => f.name === file.name && f.size === file.size))
        return prev;
      return [...prev, file];
    });
    setFileStates((prev) => ({
      ...prev,
      [file.name + file.size]: { progress: 0, uploading: false, paused: false },
    }));
    return false;
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

  // 批量上传主流程
  const handleStartAll = async () => {
    if (files.length === 0) return;
    setUploadingAll(true);
    for (const file of files) {
      await handleStart(file);
    }
    setUploadingAll(false);
  };

  // handleStart 支持单文件独立状态
  const handleStart = async (file: File) => {
    if (!file) return;
    const fileKey = file.name + file.size;
    setFileStates((prev) => ({
      ...prev,
      [fileKey]: {
        ...prev[fileKey],
        uploading: true,
        paused: false,
        stopped: false,
        controllers: [],
      },
    }));
    message.loading({ content: "正在计算MD5...", key: "md5-" + fileKey });
    let fileMd5 = fileStates[fileKey]?.md5;
    if (!fileMd5) {
      fileMd5 = await calcFileMD5WithWorker(file);
      setFileStates((prev) => ({
        ...prev,
        [fileKey]: { ...prev[fileKey], md5: fileMd5 },
      }));
    }
    const fileId = `${fileMd5}-${file.name}-${file.size}`;
    message.success({
      content: `MD5: ${fileMd5}`,
      key: "md5-" + fileKey,
      duration: 1,
    });
    let uploadedList: number[] = [];
    const local = localStorage.getItem(LOCAL_KEY_PREFIX + fileId);
    if (local) {
      uploadedList = JSON.parse(local).uploadedList || [];
    } else {
      const uploadedRes = await request.get("/file/status", {
        params: { file_id: fileId, md5: fileMd5 },
      });
      uploadedList = uploadedRes?.data?.chunks || [];
    }
    const chunks: Chunk[] = createFileChunks(file, chunkSize);
    setFileStates((prev) => ({
      ...prev,
      [fileKey]: {
        ...prev[fileKey],
        totalChunks: chunks.length,
        uploadingChunks: uploadedList.length,
      },
    }));
    const pendingChunks = chunks.filter((c) => !uploadedList.includes(c.index));
    // 独立 async.queue
    const queue = async.queue((chunk: Chunk, cb) => {
      setFileStates((prev) => {
        const state = prev[fileKey];
        if (state.paused || state.stopped) return prev;
        return prev;
      });
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
          setFileStates((prev) => {
            const state = prev[fileKey];
            return {
              ...prev,
              [fileKey]: {
                ...state,
                controllers: [...(state.controllers || []), controller],
              },
            };
          });
          return request.post("/file/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            signal: controller.signal,
          });
        }
      )
        .then(() => {
          setFileStates((prev) => {
            const state = prev[fileKey];
            const uploadingChunks = (state.uploadingChunks || 0) + 1;
            const progress = Math.round(
              (uploadingChunks / (state.totalChunks || 1)) * 100
            );
            return {
              ...prev,
              [fileKey]: {
                ...state,
                uploadingChunks,
                progress,
              },
            };
          });
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
          setFileStates((prev) => ({
            ...prev,
            [fileKey]: { ...prev[fileKey], uploading: false },
          }));
          cb(e);
        });
    }, concurrent);
    queue.drain(() => {
      setFileStates((prev) => ({
        ...prev,
        [fileKey]: { ...prev[fileKey], uploading: false },
      }));
      if (!fileStates[fileKey]?.stopped && !fileStates[fileKey]?.paused) {
        request
          .post("/file/merge", {
            file_id: fileId,
            md5: fileMd5,
            name: file.name,
            size: file.size,
            total: chunks.length,
          })
          .then(() => {
            message.success("上传完成并合并成功");
            setTimeout(() => {
              setFiles((prev) =>
                prev.filter((f) => f.name + f.size !== fileKey)
              );
              setFileStates((prev) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [fileKey]: _unused, ...rest } = prev;
                return rest;
              });
              localStorage.removeItem(LOCAL_KEY_PREFIX + fileId);
            }, 1000);
          });
      }
    });
    setFileStates((prev) => ({
      ...prev,
      [fileKey]: {
        ...prev[fileKey],
        queue,
      },
    }));
    queue.push(pendingChunks);
  };

  // 暂停单文件
  const handlePause = (file: File) => {
    const fileKey = file.name + file.size;
    setFileStates((prev) => {
      const state = prev[fileKey];
      state.queue?.pause();
      (state.controllers || []).forEach((c) => c.abort());
      return {
        ...prev,
        [fileKey]: { ...state, paused: true, uploading: false },
      };
    });
  };

  // 恢复单文件
  const handleResume = (file: File) => {
    const fileKey = file.name + file.size;
    setFileStates((prev) => {
      const state = prev[fileKey];
      state.queue?.resume();
      return {
        ...prev,
        [fileKey]: { ...state, paused: false, uploading: true },
      };
    });
  };

  // 中断单文件
  const handleStop = (file: File) => {
    const fileKey = file.name + file.size;
    setFileStates((prev) => {
      const state = prev[fileKey];
      state.queue?.kill();
      (state.controllers || []).forEach((c) => c.abort());
      return {
        ...prev,
        [fileKey]: { ...state, stopped: true, uploading: false, paused: false },
      };
    });
    setTimeout(() => {
      setFiles((prev) => prev.filter((f) => f.name + f.size !== fileKey));
      setFileStates((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [fileKey]: _unused, ...rest } = prev;
        return rest;
      });
    }, 500);
  };

  return (
    <div>
      <Upload
        beforeUpload={handleBeforeUpload}
        showUploadList={false}
        disabled={uploadingAll}
        accept={accept}
        multiple={multiple}
      >
        <Button icon={<UploadOutlined />}>选择文件</Button>
      </Upload>
      <Button
        type="primary"
        style={{ marginLeft: 8 }}
        onClick={handleStartAll}
        disabled={uploadingAll || files.length === 0}
      >
        上传全部
      </Button>
      <Button
        style={{ marginLeft: 8 }}
        onClick={() => {
          if (resumeTaskList.length === 0) {
            message.info("暂无可恢复的上传任务");
            return;
          }
          setResumeTask(resumeTaskList[0]);
          setShowResume(true);
        }}
        disabled={uploadingAll}
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
          disabled={uploadingAll}
        />
        <span style={{ marginLeft: 16 }}>并发数: </span>
        <InputNumber
          min={1}
          max={10}
          value={concurrent}
          onChange={(v) => setConcurrent(Number(v))}
          disabled={uploadingAll}
        />
      </div>
      {files.map((file) => {
        const state = fileStates[file.name + file.size] || {};
        return (
          <div
            key={file.name + file.size}
            style={{
              marginTop: 16,
              border: "1px solid #eee",
              padding: 8,
              borderRadius: 4,
            }}
          >
            <div>{file.name}</div>
            <div>文件大小：{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            <Progress percent={state.progress || 0} />
            <div style={{ marginTop: 8 }}>
              {!state.uploading && !state.paused && (
                <Button
                  type="primary"
                  onClick={() => handleStart(file)}
                  icon={<CaretRightOutlined />}
                  disabled={state.uploading}
                >
                  开始上传
                </Button>
              )}
              {state.uploading && !state.paused && (
                <Button
                  onClick={() => handlePause(file)}
                  icon={<PauseOutlined />}
                >
                  暂停
                </Button>
              )}
              {state.paused && (
                <Button
                  type="primary"
                  onClick={() => handleResume(file)}
                  icon={<CaretRightOutlined />}
                >
                  恢复
                </Button>
              )}
              {(state.uploading || state.paused) && (
                <Button
                  danger
                  onClick={() => handleStop(file)}
                  icon={<StopOutlined />}
                >
                  中断上传
                </Button>
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              <span>
                {state.uploadingChunks || 0}/{state.totalChunks || 0} 分片已上传
              </span>
              {state.md5 && (
                <span style={{ marginLeft: 16 }}>MD5: {state.md5}</span>
              )}
            </div>
          </div>
        );
      })}
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
