import { useEffect, useRef, useState } from "react";

// 网络类型与并发数映射
export const NETWORK_CONCURRENCY_MAP: Record<string, number> = {
  wifi: 5,
  ethernet: 5,
  "4g": 3,
  "5g": 3,
  "3g": 1,
  "2g": 1,
  "slow-2g": 1,
  unknown: 2,
  "": 2,
};

function getNetworkType() {
  const connection = (navigator as any).connection as {
    effectiveType?: string;
    addEventListener?: (type: string, listener: () => void) => void;
    removeEventListener?: (type: string, listener: () => void) => void;
  };
  return connection?.effectiveType || "unknown";
}

/**
 * 获取当前网络类型，并在网络类型变化时自动更新
 */
export function useNetworkType() {
  const [networkType, setNetworkType] = useState(getNetworkType());
  const concurrencyRef = useRef(NETWORK_CONCURRENCY_MAP[getNetworkType()] || 2);

  useEffect(() => {
    const connection = (navigator as any).connection as {
      effectiveType?: string;
      addEventListener?: (type: string, listener: () => void) => void;
      removeEventListener?: (type: string, listener: () => void) => void;
    };
    if (!connection || typeof connection.addEventListener !== "function")
      return;
    const handler = () => {
      const type = getNetworkType();
      setNetworkType(type);
      concurrencyRef.current = NETWORK_CONCURRENCY_MAP[type] || 2;
    };
    connection.addEventListener("change", handler);
    return () => {
      if (typeof connection.removeEventListener === "function") {
        connection.removeEventListener("change", handler);
      }
    };
  }, []);

  return { networkType, concurrency: concurrencyRef.current };
}
