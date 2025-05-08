import { Modal, Upload, message } from "antd";
import {
  appendSpeedHistory,
  calcFileMD5WithWorker,
  calcSpeedAndLeftTime,
  calcTotalSpeed,
  checkFileBeforeUpload,
  createFileChunks,
} from "../utils";
import {
  checkInstantUpload,
  getFileStatus,
  mergeFile,
  uploadFileChunk,
} from "../api";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 文件上传队列与主流程 Hook
 * 封装所有上传相关状态与操作，支持分片、秒传、进度、速率、错误等。
 * @param options.accept 支持的文件类型（如 .png,.jpg,image/*）
 * @param options.maxSizeMB 最大文件大小（MB）
 * @param options.multiple 是否多文件上传（未用到，可忽略）
 * @param options.concurrency 并发上传数
 * @param options.chunkSize 分片大小（字节）
 * @returns 所有上传相关状态与操作方法
 */
export function useFileUploadQueue({
  accept = "*",
  maxSizeMB = 2048,
  multiple = true,
  concurrency = 3,
  chunkSize = 2 * 1024 * 1024,
}: {
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  concurrency?: number;
  chunkSize?: number;
}) {
  /**
   * 文件列表
   */
  const [files, setFiles] = useState<File[]>([]);
  /**
   * MD5 及分片MD5信息
   */
  const [md5Info, setMd5Info] = useState<
    Record<string, { fileMD5: string; chunkMD5s: string[] }>
  >({});
  /**
   * 秒传/分片存在性信息
   */
  const [instantInfo, setInstantInfo] = useState<
    Record<string, { uploaded: boolean; chunkCheckResult: any[] }>
  >({});
  /**
   * 上传进度与状态
   */
  const [uploadingInfo, setUploadingInfo] = useState<
    Record<string, { progress: number; status: string }>
  >({});
  /**
   * 当前 loading 文件 key
   */
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  /**
   * 批量上传中标记
   */
  const [uploadingAll, setUploadingAll] = useState(false);
  /**
   * 速率与剩余时间
   */
  const [speedInfo, setSpeedInfo] = useState<
    Record<string, { speed: number; leftTime: number }>
  >({});
  /**
   * 速率滑动窗口历史
   */
  const speedHistoryRef = useRef<
    Record<string, Array<{ time: number; loaded: number }>>
  >({});
  /**
   * 错误信息
   */
  const [errorInfo, setErrorInfo] = useState<Record<string, string>>({});

  /**
   * beforeUpload 校验
   * @param file 文件对象
   * @returns 是否允许上传
   */
  const handleBeforeUpload = useCallback(
    (file: File) => {
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
    },
    [accept, maxSizeMB]
  );

  /**
   * 计算MD5并秒传验证
   * @param file 文件对象
   */
  const handleCalcMD5 = useCallback(
    async (file: File) => {
      setLoadingKey(file.name + file.size);
      try {
        const result = await calcFileMD5WithWorker(file, chunkSize);
        setMd5Info((prev) => ({ ...prev, [file.name + file.size]: result }));
        // message.success(`MD5计算完成: ${result.fileMD5}`);
        // 秒传验证
        const fileId = `${result.fileMD5}-${file.name}-${file.size}`;
        const chunks = createFileChunks(file, chunkSize);
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
        // if (instantRes.uploaded) {
        //   message.success("[秒传] 文件已存在，无需上传");
        // } else {
        //   const needUpload = instantRes.chunkCheckResult.filter(
        //     (c: any) => !c.exist || !c.match
        //   ).length;
        //   message.info(`[秒传] 需上传分片数: ${needUpload}`);
        // }
      } catch {
        // message.error("MD5或秒传接口异常");
      } finally {
        setLoadingKey(null);
      }
    },
    [chunkSize]
  );

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
  }, [files, md5Info, loadingKey, handleCalcMD5]);

  // 分片上传主流程
  const handleStartUpload = useCallback(
    async (file: File, resumeInfo?: any) => {
      const key = file.name + file.size;
      setErrorInfo((prev) => ({ ...prev, [key]: "" }));
      const md5 = md5Info[key]?.fileMD5 || resumeInfo?.md5;
      if (!md5) {
        // message.error("请先计算MD5");
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
      const needUploadChunks = createFileChunks(file, chunkSize).filter(
        (c) => !uploadedChunks.includes(c.index)
      );
      let uploadedCount = uploadedChunks.length;
      let uploadedBytes = uploadedChunks.reduce(
        (sum, idx) =>
          sum +
          (createFileChunks(file, chunkSize)[idx]?.end -
            createFileChunks(file, chunkSize)[idx]?.start),
        0
      );
      setUploadingInfo((prev) => ({
        ...prev,
        [key]: {
          progress: Math.round(
            (uploadedCount / createFileChunks(file, chunkSize).length) * 100
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
        const chunkSizeVal = chunk.end - chunk.start;
        while (retry < 5) {
          try {
            await uploadFileChunk({
              fileId,
              md5,
              index: chunk.index,
              chunk: chunk.chunk,
              name: file.name,
              total: createFileChunks(file, chunkSize).length,
            });
            uploadedCount++;
            uploadedBytes += chunkSizeVal;
            uploadedChunks.push(chunk.index);
            setUploadingInfo((prev) => ({
              ...prev,
              [key]: {
                progress: Math.round(
                  (uploadedCount / createFileChunks(file, chunkSize).length) *
                    100
                ),
                status: "uploading",
              },
            }));
            const now = Date.now();
            const prevHistory = speedHistoryRef.current[key] || [];
            speedHistoryRef.current[key] = appendSpeedHistory(
              prevHistory,
              now,
              uploadedBytes,
              5 // SPEED_WINDOW
            );
            const history = speedHistoryRef.current[key];
            if (history.length >= 2) {
              const { speed, leftTime } = calcSpeedAndLeftTime(
                history,
                file.size
              );
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
                    (uploadedCount / createFileChunks(file, chunkSize).length) *
                      100
                  ),
                  status: "error",
                },
              }));
              setErrorInfo((prev) => ({
                ...prev,
                [key]: err?.message || "分片上传失败",
              }));
              // message.error(`分片${chunk.index}上传失败`);
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
          total: createFileChunks(file, chunkSize).length,
        });
        setUploadingInfo((prev) => ({
          ...prev,
          [key]: { progress: 100, status: "done" },
        }));
        setSpeedInfo((prev) => ({ ...prev, [key]: { speed: 0, leftTime: 0 } }));
        setErrorInfo((prev) => ({ ...prev, [key]: "" }));
        // message.success("上传并合并完成");
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
        // message.error("合并失败");
      }
    },
    [md5Info, chunkSize]
  );

  // 重试单个文件
  const handleRetry = useCallback(
    (file: File) => {
      handleStartUpload(file);
    },
    [handleStartUpload]
  );

  // 重试所有失败文件
  const handleRetryAllFailed = useCallback(async () => {
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
    // message.success("所有失败文件已重试");
  }, [files, uploadingInfo, handleStartUpload]);

  // 批量上传自动补齐MD5
  const handleStartAll = useCallback(async () => {
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
    for (let i = 0; i < Math.min(concurrency, needUploadFiles.length); i++) {
      queue.push(next());
    }
    await Promise.all(queue);
    setUploadingAll(false);
    // message.success("全部上传任务已完成");
  }, [
    files,
    md5Info,
    instantInfo,
    uploadingInfo,
    handleCalcMD5,
    handleStartUpload,
    concurrency,
  ]);

  // 单个文件上传按钮自动补齐MD5
  const handleStartUploadWithAutoMD5 = useCallback(
    async (file: File) => {
      const key = file.name + file.size;
      if (!md5Info[key]) {
        await handleCalcMD5(file);
      }
      await handleStartUpload(file);
    },
    [md5Info, handleCalcMD5, handleStartUpload]
  );

  return {
    files,
    setFiles,
    md5Info,
    instantInfo,
    uploadingInfo,
    loadingKey,
    uploadingAll,
    speedInfo,
    errorInfo,
    handleBeforeUpload,
    handleCalcMD5,
    handleStartUpload,
    handleStartAll,
    handleRetry,
    handleRetryAllFailed,
    handleStartUploadWithAutoMD5,
    calcTotalSpeed,
  };
}
