// @ts-nocheck
importScripts("https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.min.js");

self.onmessage = function (e) {
  const file = e.data;
  const chunkSize = 10 * 1024 * 1024; // 10MB
  const chunks = Math.ceil(file.size / chunkSize);
  let currentChunk = 0;
  const spark = new self.SparkMD5.ArrayBuffer();
  const fileReader = new FileReaderSync();

  while (currentChunk < chunks) {
    const start = currentChunk * chunkSize;
    const end = Math.min(file.size, start + chunkSize);
    const chunk = file.slice(start, end);
    const buffer = fileReader.readAsArrayBuffer(chunk);
    spark.append(buffer);
    currentChunk++;
  }
  self.postMessage(spark.end());
};
