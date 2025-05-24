import { Spin } from "antd";
import { useGlobalLoading } from "@/store/globalLoading";

export default function GlobalLoading() {
	const loading = useGlobalLoading((s) => s.loading);
	return loading ? <Spin size="large" tip="加载中..." fullscreen /> : null;
}
