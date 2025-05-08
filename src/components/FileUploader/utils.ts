// 上传相关工具函数

/**
 * 校验文件类型和大小
 */
export function checkFileBeforeUpload({
  file,
  accept,
  maxSizeMB,
  onError,
}: {
  file: File;
  accept: string;
  maxSizeMB: number;
  onError: (msg: string) => void;
}) {
  const acceptList = accept.split(",").map((s) => s.trim().toLowerCase());
  const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
  const fileType = file.type.toLowerCase();
  // 类型校验
  const typeOk =
    acceptList.includes("*") ||
    acceptList.includes(fileExt) ||
    (acceptList.includes("image/*") && fileType.startsWith("image/"));
  if (!typeOk) {
    onError("文件类型不支持");
    return false;
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    onError(`文件不能超过${maxSizeMB}MB`);
    return false;
  }
  return true;
}

/**
 * 文件分片切割
 */
export function createFileChunks(file: File, chunkSize: number) {
  const chunks = [];
  let cur = 0;
  while (cur < file.size) {
    chunks.push({
      index: chunks.length,
      start: cur,
      end: Math.min(cur + chunkSize, file.size),
      chunk: file.slice(cur, cur + chunkSize),
    });
    cur += chunkSize;
  }
  return chunks;
}

/**
 * 通过WebWorker计算文件MD5
 */
export function calcFileMD5WithWorker(
  file: File,
  chunkSize: number
): Promise<{ fileMD5: string; chunkMD5s: string[] }> {
  return new Promise((resolve, reject) => {
    // worker-md5.js 需后续补全
    const worker = new Worker(new URL("./worker-md5.js", import.meta.url));
    worker.postMessage({ file, chunkSize });
    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate();
    };
    worker.onerror = (err) => {
      reject(err);
      worker.terminate();
    };
  });
}

/**
 * 追加速率滑动窗口历史
 * @param history 现有历史数组
 * @param time 当前时间戳
 * @param loaded 当前已上传字节数
 * @param windowSize 滑动窗口大小
 * @returns 新的历史数组
 */
export function appendSpeedHistory(
  history: Array<{ time: number; loaded: number }>,
  time: number,
  loaded: number,
  windowSize: number
) {
  const newHistory = [...history, { time, loaded }];
  if (newHistory.length > windowSize) newHistory.shift();
  return newHistory;
}

/**
 * 计算速率和剩余时间
 * @param history 滑动窗口历史
 * @param fileSize 文件总大小
 * @returns { speed: number, leftTime: number }
 */
export function calcSpeedAndLeftTime(
  history: Array<{ time: number; loaded: number }>,
  fileSize: number
) {
  if (history.length < 2) return { speed: 0, leftTime: 0 };
  const first = history[0];
  const last = history[history.length - 1];
  const speed =
    (last.loaded - first.loaded) / ((last.time - first.time) / 1000); // B/s
  const leftBytes = fileSize - last.loaded;
  const leftTime = speed > 0 ? leftBytes / speed : 0;
  return { speed, leftTime };
}

/**
 * 统计总速率
 * @param speedInfo 所有文件的速率信息
 * @returns 总速率（B/s）
 */
export function calcTotalSpeed(
  speedInfo: Record<string, { speed: number; leftTime: number }>
) {
  return Object.values(speedInfo).reduce((sum, s) => sum + (s.speed || 0), 0);
}
