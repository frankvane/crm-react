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
