import { Spin } from "antd";
import { useGlobalLoading } from "@/store/globalLoading";

export default function GlobalLoading() {
  const loading = useGlobalLoading((s) => s.loading);
  return loading ? (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        background: "rgba(255,255,255,0.5)",
      }}
    >
      <Spin size="large" tip="加载中..." fullscreen />
    </div>
  ) : null;
}
