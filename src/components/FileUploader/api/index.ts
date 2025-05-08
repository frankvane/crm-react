// 文件上传相关 API 封装

const API_PREFIX = "http://localhost:3000/api";

// 秒传验证API（需后端接口支持）
export async function checkInstantUpload({
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
export async function getFileStatus({
  fileId,
  md5,
}: {
  fileId: string;
  md5: string;
}) {
  const res = await fetch(
    `${API_PREFIX}/file/status?file_id=${encodeURIComponent(fileId)}&md5=${md5}`
  );
  const data = await res.json();
  if (data.code !== 200) throw new Error(data.message || "状态检测失败");
  return data.data?.chunks || [];
}

// 上传单个分片
export async function uploadFileChunk({
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
export async function mergeFile({
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
