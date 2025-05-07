import { useEffect, useState } from "react";

/**
 * 动态根据网络状况调整 chunkSize 和并发数，支持网络切换实时响应
 * @returns [chunkSize, setChunkSize, concurrent, setConcurrent]
 */
const useDynamicUploadConfig = () => {
  const [chunkSize, setChunkSize] = useState(1 * 1024 * 1024);
  const [concurrent, setConcurrent] = useState(3);

  // 封装设置逻辑，便于复用
  const updateConfig = () => {
    let rtt: number | undefined = undefined;
    const connection: any = navigator.connection;
    if (connection && typeof connection.rtt === "number") {
      rtt = connection.rtt;
    }
    const netType = connection?.effectiveType || connection?.type || "unknown";
    if (typeof rtt === "number") {
      if (rtt <= 100) {
        setChunkSize(12 * 1024 * 1024);
        setConcurrent(6);
      } else if (rtt <= 150) {
        setChunkSize(8 * 1024 * 1024);
        setConcurrent(4);
      } else if (rtt <= 550) {
        setChunkSize(4 * 1024 * 1024);
        setConcurrent(2);
      } else {
        setChunkSize(1 * 1024 * 1024);
        setConcurrent(1);
      }
    } else if (navigator.onLine) {
      // 优先用 effectiveType
      if (netType === "4g") {
        setChunkSize(10 * 1024 * 1024);
        setConcurrent(5);
      } else if (netType === "3g") {
        setChunkSize(2 * 1024 * 1024);
        setConcurrent(2);
      } else if (netType === "2g" || netType === "slow-2g") {
        setChunkSize(1 * 1024 * 1024);
        setConcurrent(1);
      } else if (
        typeof navigator.connection !== "undefined" &&
        (navigator.connection as any).type === "wifi"
      ) {
        setChunkSize(10 * 1024 * 1024);
        setConcurrent(5);
      } else {
        setChunkSize(1 * 1024 * 1024);
        setConcurrent(3);
      }
    }
  };

  useEffect(() => {
    updateConfig();
    const connection: any = navigator.connection;
    if (connection && typeof connection.addEventListener === "function") {
      connection.addEventListener("change", updateConfig);
      return () => {
        connection.removeEventListener("change", updateConfig);
      };
    }
    // 兼容部分浏览器只支持 onChange
    if (connection && "onchange" in connection) {
      connection.onchange = updateConfig;
      return () => {
        connection.onchange = null;
      };
    }
  }, []);

  return [chunkSize, setChunkSize, concurrent, setConcurrent] as const;
};

export default useDynamicUploadConfig;
