import { Button, Input } from "antd";
import React, { useEffect, useRef } from "react";

interface ChatInputBarProps {
	inputValue: string;
	setInputValue: (val: string) => void;
	isFetching: boolean;
	onFetch: () => void;
	onAbort: () => void;
	autoFocus?: boolean;
	onInputFocus?: () => void;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({
	inputValue,
	setInputValue,
	isFetching,
	onFetch,
	onAbort,
	autoFocus,
	onInputFocus,
}) => {
	const inputRef = useRef<any>(null);

	useEffect(() => {
		if (autoFocus && inputRef.current) {
			inputRef.current.focus();
		}
	}, [autoFocus]);

	// 处理快捷键发送和换行
	const handlePressEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.ctrlKey || e.shiftKey) {
			// 允许换行
			return;
		}
		e.preventDefault();
		if (!isFetching && inputValue.trim()) {
			onFetch();
		}
	};

	const handleFocus = () => {
		if (onInputFocus) onInputFocus();
	};

	return (
		<div style={{ display: "flex", alignItems: "center", width: "100%" }}>
			<Input.TextArea
				ref={inputRef}
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				placeholder="请输入问题"
				onPressEnter={handlePressEnter}
				autoSize={{ minRows: 1, maxRows: 6 }}
				style={{ flex: 1, margin: "0 10px", resize: "none" }}
				disabled={isFetching}
				autoFocus={autoFocus}
				onFocus={handleFocus}
			/>
			<Button
				type="primary"
				onClick={onFetch}
				disabled={isFetching || !inputValue.trim()}
				style={{ flexShrink: 0 }}
			>
				{isFetching ? "提问中..." : "提问"}
			</Button>
			{isFetching && (
				<Button
					onClick={onAbort}
					danger
					style={{ flexShrink: 0, marginLeft: 8 }}
				>
					中断
				</Button>
			)}
		</div>
	);
};

export default ChatInputBar;
