import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
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
}

const ChatMessageList = forwardRef<ChatMessageListRef, ChatMessageListProps>(
  ({ messages, isFetching, onScrollStatusChange, onSelectText }, ref) => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentEndRef = useRef<HTMLDivElement>(null);
    const prevIsFetching = useRef(isFetching);
    const lastMsg = messages[messages.length - 1];
    const showLoading =
      isFetching &&
      (!lastMsg || lastMsg.role !== "assistant" || !lastMsg.content);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [isAtTop, setIsAtTop] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const PAGE_SIZE = 2;
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
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
      setVisibleCount(PAGE_SIZE); // 新消息时重置只显示最新3条
    }, [messages.length]);

    // 自动滚动到最新消息
    useEffect(() => {
      if (virtuosoRef.current && messages.length > 0 && shouldAutoScroll) {
        const behavior =
          isFetching || prevIsFetching.current ? "auto" : "smooth";
        virtuosoRef.current.scrollToIndex({
          index: messages.length - 1,
          align: "end",
          behavior,
        });
      }
      prevIsFetching.current = isFetching;
    }, [messages.length, isFetching, shouldAutoScroll]);

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        scrollToTop: () => {
          virtuosoRef.current?.scrollToIndex({
            index: 0,
            align: "start",
            behavior: "smooth",
          });
        },
        scrollToBottom: () => {
          if (messages.length > 0) {
            virtuosoRef.current?.scrollToIndex({
              index: messages.length - 1,
              align: "end",
              behavior: "smooth",
            });
          }
        },
        isAtTop,
        isAtBottom,
      }),
      [isAtTop, isAtBottom, messages.length]
    );

    // 文本选择功能
    const handleMouseUp = () => {
      const text = window.getSelection()?.toString();
      if (text && text.trim() && onSelectText) {
        onSelectText(text.trim());
      }
    };

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
          height: "100%",
        }}
        onMouseUp={handleMouseUp}
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
                Math.min(messages.length, prev + PAGE_SIZE)
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
  }
);

export default ChatMessageList;
