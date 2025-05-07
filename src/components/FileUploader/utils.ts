// 切片函数
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

// 计算MD5（worker通信）
export function calcFileMD5WithWorker(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./worker-md5.js", import.meta.url));
    worker.postMessage(file);
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

// 分片重试（伪代码骨架）
export async function uploadChunkWithRetry<T>(
  chunkData: T,
  uploadFn: (data: T) => Promise<any>,
  maxRetry = 3
) {
  let retry = 0;
  while (retry < maxRetry) {
    try {
      return await uploadFn(chunkData);
    } catch (e) {
      retry++;
      if (retry >= maxRetry) throw e;
    }
  }
}

// 进度计算
export function calcProgress(uploaded: number, total: number) {
  return Math.floor((uploaded / total) * 100);
}

// 原子写入+重试，确保 uploadedList 不丢分片
export function atomicUpdateUploadedList(
  localKeyPrefix: string,
  fileId: string,
  chunkIndex: number,
  fileMd5: string,
  file: File,
  totalChunks: number
) {
  let uploadedListLocal: number[] = [];
  const local = localStorage.getItem(localKeyPrefix + fileId);
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
    localStorage.setItem(localKeyPrefix + fileId, newStr);
  } catch (err) {
    console.error("[atomicUpdateUploadedList] localStorage 写入失败:", err);
  }
}

// 文件类型和大小校验
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
