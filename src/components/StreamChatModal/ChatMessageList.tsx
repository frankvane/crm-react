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
    const prevIsFetching = useRef(isFetching);
    const lastMsg = messages[messages.length - 1];
    const showLoading =
      isFetching &&
      (!lastMsg || lastMsg.role !== "assistant" || !lastMsg.content);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [isAtTop, setIsAtTop] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);

    // 监听滚动状态
    const handleScrollStatus = ({
      atTop,
      atBottom,
    }: {
      atTop: boolean;
      atBottom: boolean;
    }) => {
      setIsAtTop(atTop);
      setIsAtBottom(atBottom);
      setShouldAutoScroll(atBottom); // 用户在底部时启用自动滚动，向上滚动时禁用
      if (onScrollStatusChange) {
        onScrollStatusChange({ isAtTop: atTop, isAtBottom: atBottom });
      }
    };

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
          position: "relative",
          height: "100%",
          padding: "15px 5px 0 15px",
        }}
        onMouseUp={handleMouseUp}
      >
        <Virtuoso
          ref={virtuosoRef}
          style={{ height: "100%" }}
          totalCount={messages.length}
          overscan={20}
          atTopStateChange={(atTop) =>
            handleScrollStatus({ atTop, atBottom: isAtBottom })
          }
          atBottomStateChange={(atBottom) =>
            handleScrollStatus({ atTop: isAtTop, atBottom })
          }
          followOutput={() => (shouldAutoScroll ? "smooth" : false)}
          itemContent={(index) => <ChatMessageItem msg={messages[index]} />}
          computeItemKey={(index) => messages[index].id} // 确保唯一键
          components={{
            Footer: showLoading
              ? () => (
                  <div
                    style={{
                      color: "#1890ff",
                      textAlign: "left",
                      margin: "8px 0 0 40px",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "0 0 10px 0",
                    }}
                  >
                    <Spin size="small" style={{ marginRight: 8 }} />
                    正在生成回复...
                  </div>
                )
              : undefined,
          }}
          defaultItemHeight={100}
          increaseViewportBy={{ top: 20, bottom: 20 }}
          initialTopMostItemIndex={
            messages.length > 0 ? messages.length - 1 : 0
          }
        />
      </div>
    );
  }
);

export default ChatMessageList;
