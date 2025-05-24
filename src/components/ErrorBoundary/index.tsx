import React from "react";

interface State {
	hasError: boolean;
	error: any;
}

export class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	State
> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false, error: null };
	}
	static getDerivedStateFromError(error: any) {
		return { hasError: true, error };
	}
	componentDidCatch(error: any, info: any) {
		// 可上报错误日志
		console.error(error, info);
	}
	render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: 48, textAlign: "center" }}>
					<h2>页面出错了</h2>
					<div style={{ color: "#f5222d" }}>{String(this.state.error)}</div>
				</div>
			);
		}
		return this.props.children;
	}
}
