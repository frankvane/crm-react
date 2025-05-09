import React, {
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
}

const ChatMessageList = forwardRef<ChatMessageListRef, ChatMessageListProps>(
  ({ messages, isFetching, onScrollStatusChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentEndRef = useRef<HTMLDivElement>(null);
    const lastMsg = messages[messages.length - 1];
    const showLoading =
      isFetching &&
      (!lastMsg || lastMsg.role !== "assistant" || !lastMsg.content);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [isAtTop, setIsAtTop] = useState(true);

    // 监听用户滚动，判断是否在底部/顶部
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
        setIsAtBottom(atBottom);
        setIsAtTop(atTop);
      };
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    // 内容变更时，仅在shouldAutoScroll为true时自动滚动到底部
    useEffect(() => {
      const container = containerRef.current;
      if (!container || !shouldAutoScroll) return;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
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
          if (container) container.scrollTop = 0;
        },
        scrollToBottom: () => {
          const container = containerRef.current;
          if (container) container.scrollTop = container.scrollHeight;
        },
        isAtTop,
        isAtBottom,
      }),
      [isAtTop, isAtBottom]
    );

    return (
      <div
        ref={containerRef}
        className="markdown-body"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px",
          position: "relative",
        }}
      >
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} msg={msg} />
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
  }
);

export default ChatMessageList;
