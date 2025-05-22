import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

import ChatMessageItem from "./ChatMessageItem";
import type { Message } from "./types";
import { Spin } from "antd";

export interface ChatMessageListRef {
	scrollToTop: () => void;
	scrollToBottom: () => void;
	isAtTop: boolean;
	isAtBottom: boolean;
}

interface ChatMessageListProps {
	messages: Message[];
	isFetching?: boolean;
	onScrollStatusChange?: (status: {
		isAtTop: boolean;
		isAtBottom: boolean;
	}) => void;
	onSelectText?: (text: string) => void;
	pageSize?: number;
}

const ChatMessageList = forwardRef<ChatMessageListRef, ChatMessageListProps>(
	(
		{ messages, isFetching, onScrollStatusChange, onSelectText, pageSize = 2 },
		ref,
	) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const contentEndRef = useRef<HTMLDivElement>(null);
		const lastMsg = messages[messages.length - 1];
		const showLoading =
			isFetching &&
			(!lastMsg || lastMsg.role !== "assistant" || !lastMsg.content);
		const prevIsFetching = useRef(isFetching);
		const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
		const [isAtTop, setIsAtTop] = useState(true);
		const [isAtBottom, setIsAtBottom] = useState(true);
		const [visibleCount, setVisibleCount] = useState(pageSize);
		const visibleMessages = messages.slice(-visibleCount);

		// 监听用户滚动，判断是否在底部
		useEffect(() => {
			const container = containerRef.current;
			if (!container) return;
			const tolerance = 5;
			const handleScroll = () => {
				const atBottom =
					container.scrollHeight -
						container.scrollTop -
						container.clientHeight <=
					tolerance;
				const atTop = container.scrollTop <= tolerance;
				setShouldAutoScroll(atBottom);
				setIsAtTop(atTop);
				setIsAtBottom(atBottom);
			};
			container.addEventListener("scroll", handleScroll);
			return () => container.removeEventListener("scroll", handleScroll);
		}, [messages.length, visibleCount]);

		useEffect(() => {
			if (!contentEndRef.current) return;
			if (isFetching && shouldAutoScroll) {
				contentEndRef.current.scrollIntoView({ behavior: "auto" });
			} else if (prevIsFetching.current && shouldAutoScroll) {
				contentEndRef.current.scrollIntoView({ behavior: "smooth" });
			}
			prevIsFetching.current = isFetching;
		}, [messages, isFetching, shouldAutoScroll]);

		// 通知父组件当前滚动状态
		useEffect(() => {
			if (onScrollStatusChange) {
				onScrollStatusChange({ isAtTop, isAtBottom });
			}
		}, [isAtTop, isAtBottom, onScrollStatusChange]);

		// 暴露方法给父组件
		useImperativeHandle(
			ref,
			() => ({
				scrollToTop: () => {
					const container = containerRef.current;
					if (container) {
						container.scrollTo({ top: 0, behavior: "smooth" });
					}
				},
				scrollToBottom: () => {
					const container = containerRef.current;
					if (container) {
						container.scrollTo({
							top: container.scrollHeight,
							behavior: "smooth",
						});
					}
				},
				isAtTop,
				isAtBottom,
			}),
			[isAtTop, isAtBottom],
		);

		useEffect(() => {
			setVisibleCount(pageSize); // 新消息时重置只显示最新pageSize条
		}, [messages.length, pageSize]);

		return (
			<div
				ref={containerRef}
				className="markdown-body"
				style={{
					flex: 1,
					minHeight: 0,
					overflowY: "auto",
					overflowX: "hidden",
					padding: "10px",
					marginBottom: "10px",
					position: "relative",
				}}
				onMouseUp={() => {
					const text = window.getSelection()?.toString();
					if (text && text.trim() && onSelectText) {
						onSelectText(text.trim());
					}
				}}
			>
				{visibleCount < messages.length && (
					<div
						style={{
							textAlign: "center",
							color: "#1890ff",
							cursor: "pointer",
							marginBottom: 8,
							userSelect: "none",
						}}
						onClick={() =>
							setVisibleCount((prev) =>
								Math.min(messages.length, prev + pageSize),
							)
						}
					>
						查看更多历史消息
					</div>
				)}
				{visibleMessages.map((msg, i) => (
					<div key={msg.id} style={{ display: "flex", alignItems: "center" }}>
						<ChatMessageItem
							msg={msg}
							index={messages.length - visibleMessages.length + i}
						/>
					</div>
				))}
				{showLoading && (
					<div
						style={{
							color: "#1890ff",
							textAlign: "left",
							margin: "8px 0 0 40px",
							fontSize: 14,
							display: "flex",
							alignItems: "center",
							gap: 6,
						}}
					>
						<Spin size="small" style={{ marginRight: 8 }} />
						正在生成回复...
					</div>
				)}
				<div ref={contentEndRef} />
			</div>
		);
	},
);

export default ChatMessageList;
