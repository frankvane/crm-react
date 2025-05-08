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
