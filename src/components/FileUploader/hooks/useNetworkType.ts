import { useEffect, useMemo, useRef } from "react";

import { useNetwork } from "ahooks";

export function useNetworkType(
  onChange?: (params: { networkType: string; concurrency: number }) => void
) {
  const network = useNetwork();
  const { rtt, online, effectiveType, type } = network;

  // 离线判断
  const isOffline =
    online === false ||
    (typeof window !== "undefined" &&
      typeof window.navigator !== "undefined" &&
      window.navigator.onLine === false);

  // 并发数自适应，考虑更全面的网络因素
  const concurrency = useMemo(() => {
    if (isOffline) return 0; // 离线禁止上传

    // 基于RTT(往返时间)的并发控制，RTT值越低网络越好
    if (typeof rtt === "number" && rtt > 0) {
      if (rtt <= 50) return 6; // 极佳网络条件
      if (rtt <= 100) return 4; // 非常好的网络
      if (rtt <= 200) return 3; // 良好网络
      if (rtt <= 500) return 2; // 中等网络
      if (rtt <= 1000) return 1; // 较差网络
      return 1; // 非常差的网络，保持最低并发
    }

    // 基于网络类型的并发控制
    // 考虑连接类型和有效网络类型的组合
    if (type === "wifi") {
      if (effectiveType === "4g") return 4;
      if (effectiveType === "3g") return 3;
      return 2; // 其他wifi情况
    }

    if (type === "ethernet") return 4; // 有线连接通常较稳定

    // 移动网络
    if (effectiveType === "4g") return 3;
    if (effectiveType === "3g") return 2;
    if (effectiveType === "2g") return 1;
    if (effectiveType === "slow-2g") return 1;

    // 默认保守值
    return 2;
  }, [rtt, isOffline, effectiveType, type]);

  const networkType = isOffline
    ? "offline"
    : effectiveType || type || "unknown";

  // 变化时触发回调
  const prev = useRef<{ networkType: string; concurrency: number }>();
  useEffect(() => {
    if (
      prev.current?.networkType !== networkType ||
      prev.current?.concurrency !== concurrency
    ) {
      onChange?.({ networkType, concurrency });
      prev.current = { networkType, concurrency };
    }
  }, [networkType, concurrency, onChange]);

  return { networkType, concurrency };
}
