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
  const handleStart = async (file: File, chunkSizeParam?: number) => {
    if (!file) return;
    const fileKey = file.name + file.size;
    // 1. 先同步 fileStates，避免异步 race condition
    let fileMd5 = fileStates[fileKey]?.md5;
    // 统一 chunkSize：优先用 fileStates 里已记录的 chunkSize，首次上传才用全局 chunkSize
    let usedChunkSize = fileStates[fileKey]?.chunkSize;
    if (typeof usedChunkSize !== "number") usedChunkSize = chunkSize;
    // 禁止 chunkSize 变动，恢复/继续上传时 chunkSize 必须一致
    if (
      fileStates[fileKey]?.uploading ||
      fileStates[fileKey]?.paused ||
      fileStates[fileKey]?.stopped
    ) {
      // 恢复/继续上传，强制用 fileStates 里已记录的 chunkSize
      usedChunkSize = fileStates[fileKey]?.chunkSize;
    }
    if (!fileMd5) {
      setFileStates((prev) => ({
        ...prev,
        [fileKey]: {
          ...prev[fileKey],
          uploading: true,
          paused: false,
          stopped: false,
          controllers: [],
          chunkSize: usedChunkSize,
        },
      }));
      message.loading({ content: "正在计算MD5...", key: "md5-" + fileKey });
      fileMd5 = await calcFileMD5WithWorker(file);
      setFileStates((prev) => ({
        ...prev,
        [fileKey]: { ...prev[fileKey], md5: fileMd5 },
      }));
    } else {
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
    }
    const fileId = `${fileMd5}-${file.name}-${file.size}`;
    message.success({
      content: `MD5: ${fileMd5}`,
      key: "md5-" + fileKey,
      duration: 1,
    });

    // 秒传确认
    let instantRes: any = null;
    try {
      instantRes = await request.post("/file/instant", {
        file_id: fileId,
        md5: fileMd5,
        name: file.name,
        size: file.size,
        total: Math.ceil(file.size / (chunkSizeParam || chunkSize)),
      });
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

    // 2. uploadedList/分片状态健壮处理
    let uploadedList: number[] = [];
    let serverStatus: any = null;
    const local = localStorage.getItem(LOCAL_KEY_PREFIX + fileId);
    if (local) {
      uploadedList = JSON.parse(local).uploadedList || [];
    } else {
      serverStatus = await request.get("/file/status", {
        params: { file_id: fileId, md5: fileMd5 },
      });
      const s: any = serverStatus;
      uploadedList = Array.isArray(s?.chunks)
        ? s.chunks
        : Array.isArray(s?.data?.chunks)
        ? s.data.chunks
        : [];
    }
    const chunks = createFileChunks(file, chunkSizeParam || chunkSize);
    // 检查本地 uploadedList 是否污染
    if (uploadedList.length > 0 && uploadedList.length !== chunks.length) {
      localStorage.removeItem(LOCAL_KEY_PREFIX + fileId);
      uploadedList = [];
      message.warning("检测到分片数量异常，已自动重置本地进度");
    }
    setFileStates((prev) => ({
      ...prev,
      [fileKey]: {
        ...prev[fileKey],
        totalChunks: chunks.length,
        uploadingChunks: uploadedList.length,
      },
    }));
    const pendingChunks = chunks.filter((c) => !uploadedList.includes(c.index));
    // 3. queue/drain/merge 边界条件
    const queue = async.queue((chunk: any, cb) => {
      setFileStates((prev) => {
        const state = prev[fileKey];
        if (!state || state.stopped) return prev;
        if (state.paused) return prev;
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
            if (!state) return prev; // 判空保护，避免 undefined 报错
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
            if (!state || state.stopped) return prev;
            // 修复：每次分片上传成功后，重新读取 localStorage 的 uploadedList
            let uploadedListLocal: number[] = [];
            const local = localStorage.getItem(LOCAL_KEY_PREFIX + fileId);
            if (local) {
              uploadedListLocal = JSON.parse(local).uploadedList || [];
            }
            const uploadingChunks = uploadedListLocal.length;
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
          setFileStates((prev) => {
            const state = prev[fileKey];
            if (!state || state.stopped) return prev;
            return {
              ...prev,
              [fileKey]: { ...state, uploading: false },
            };
          });
          message.error(`分片${chunk.index}上传失败: ${e.message}`);
          cb(e);
        });
    }, concurrent);

    // 4. merge/queue 边界健壮性
    if (pendingChunks.length === 0) {
      // merge 前强制请求后端最新分片状态
      const statusRes = await request.get("/file/status", {
        params: { file_id: fileId, md5: fileMd5 },
      });
      const sr: any = statusRes;
      const serverChunks = Array.isArray(sr?.chunks)
        ? sr.chunks
        : Array.isArray(sr?.data?.chunks)
        ? sr.data.chunks
        : [];
      const serverChunkIndexes = serverChunks.map(Number);
      const allChunksUploaded = chunks.every((c) =>
        serverChunkIndexes.includes(c.index)
      );
      if (allChunksUploaded) {
        setFileStates((prev) => ({
          ...prev,
          [fileKey]: { ...prev[fileKey], uploading: false },
        }));
        if (
          !fileStates[fileKey] ||
          fileStates[fileKey].stopped ||
          fileStates[fileKey].paused
        ) {
          // 如果 fileStates[fileKey] 不存在或已中断/暂停，直接跳过 merge
          return;
        }
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
      } else if (serverChunks.length === 0) {
        // 后端没有任何分片，强制重新上传所有分片
        message.warning("后端无分片，自动重新上传所有分片");
        setFileStates((prev) => ({
          ...prev,
          [fileKey]: {
            ...prev[fileKey],
            queue,
          },
        }));
        queue.push(chunks);
        return;
      } else {
        message.error("分片状态异常，无法合并，请重试上传");
        setFileStates((prev) => ({
          ...prev,
          [fileKey]: { ...prev[fileKey], uploading: false },
        }));
      }
      return;
    }
    // 正常上传分片
    setFileStates((prev) => ({
      ...prev,
      [fileKey]: {
        ...prev[fileKey],
        queue,
      },
    }));
    queue.push(pendingChunks);

    // 修复：分片全部上传后 queue.drain 自动 merge
    queue.drain(async () => {
      // merge 前强制请求后端最新分片状态
      const statusRes = await request.get("/file/status", {
        params: { file_id: fileId, md5: fileMd5 },
      });
      const sr: any = statusRes;
      const serverChunks = Array.isArray(sr?.chunks)
        ? sr.chunks
        : Array.isArray(sr?.data?.chunks)
        ? sr.data.chunks
        : [];
      const serverChunkIndexes = serverChunks.map(Number);

      const allChunksUploaded = chunks.every((c) =>
        serverChunkIndexes.includes(c.index)
      );
      if (allChunksUploaded) {
        setFileStates((prev) => ({
          ...prev,
          [fileKey]: { ...prev[fileKey], uploading: false },
        }));
        if (
          !fileStates[fileKey] ||
          fileStates[fileKey].stopped ||
          fileStates[fileKey].paused
        ) {
          // 如果 fileStates[fileKey] 不存在或已中断/暂停，直接跳过 merge
          return;
        }
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
      } else {
        message.error("分片状态异常，无法合并，请重试上传");
        setFileStates((prev) => ({
          ...prev,
          [fileKey]: { ...prev[fileKey], uploading: false },
        }));
      }
    });
  };

  // 暂停单文件
  const handlePause = (file: File) => {
    const fileKey = file.name + file.size;
    setFileStates((prev) => {
      const state = prev[fileKey];
      if (!state) return prev;
      // 只暂停 queue，不 abort 当前分片，保证分片不丢失
      state.queue?.pause();
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
      if (!state) return prev;
      // 只恢复 queue，不重新走 handleStart，避免重复上传
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
      if (!state) return prev; // 判空保护，避免 undefined 报错
      // kill queue 并 abort 所有请求
      state.queue?.kill();
      (state.controllers || []).forEach((c: any) => c.abort());
      // 延迟移除 fileStates，UI 显示"已中断"提示
      setTimeout(() => {
        setFileStates((p) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [fileKey]: _unused, ...rest } = p;
          return rest;
        });
        setFiles((prev) => prev.filter((f) => f.name + f.size !== fileKey));
        // 清理 localStorage
        const fileMd5 = state.md5;
        if (fileMd5) {
          const fileId = `${fileMd5}-${file.name}-${file.size}`;
          localStorage.removeItem(LOCAL_KEY_PREFIX + fileId);
        }
      }, 1200);
      return {
        ...prev,
        [fileKey]: { ...state, stopped: true, uploading: false, paused: false },
      };
    });
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
