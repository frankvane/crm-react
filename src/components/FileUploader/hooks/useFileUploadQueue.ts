import {
  atomicUpdateUploadedList,
  calcFileMD5WithWorker,
  createFileChunks,
  uploadChunkWithRetry,
} from "../utils";

import async from "async";
import { message } from "antd";
import request from "@/utils/request";
import { useState } from "react";

const LOCAL_KEY_PREFIX = "fileUploader_progress_";

export default function useFileUploadQueue({
  chunkSize,
  concurrent,
  setFiles,
}: {
  chunkSize: number;
  concurrent: number;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const [fileStates, setFileStates] = useState<Record<string, any>>({});

  // 批量上传主流程
  const handleStartAll = async (files: File[]) => {
    if (files.length === 0) return;
    for (const file of files) {
      await handleStart(file);
    }
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

    // 秒传确认
    try {
      const instantRes = (await request.post("/file/instant", {
        file_id: fileId,
        md5: fileMd5,
        name: file.name,
        size: file.size,
        total: Math.ceil(file.size / chunkSize),
      })) as any;
      if (instantRes?.uploaded) {
        message.success("秒传成功，文件已存在");
        setTimeout(() => {
          setFiles((prev) => prev.filter((f) => f.name + f.size !== fileKey));
          setFileStates((prev) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [fileKey]: _unused, ...rest } = prev;
            return rest;
          });
          localStorage.removeItem(LOCAL_KEY_PREFIX + fileId);
        }, 1000);
        // 秒传成功 return，后续 status、upload、merge 都不会再执行
        return;
      }
    } catch (e) {
      console.log("秒传接口异常，降级为普通分片上传", e);
    }

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
    const chunks = createFileChunks(file, chunkSize);
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
    const queue = async.queue((chunk: any, cb) => {
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
            LOCAL_KEY_PREFIX,
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
      (state.controllers || []).forEach((c: any) => c.abort());
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
      (state.controllers || []).forEach((c: any) => c.abort());
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

  return {
    fileStates,
    setFileStates,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleStartAll,
  };
}
