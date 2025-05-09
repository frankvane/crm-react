import "github-markdown-css/github-markdown-light.css";
import "antd/dist/reset.css";

import { DownOutlined, UpOutlined } from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";

import ChatInputBar from "./ChatInputBar";
import ChatMessageList from "./ChatMessageList";
import type { ChatMessageListRef } from "./ChatMessageList";
import type { Message } from "./types";
import { useStreamChat } from "./useStreamChat";

interface StreamChatModalProps {
  visible: boolean;
  onClose: () => void;
  defaultRole: string;
  defaultQuestion: string;
  width?: number | string;
  height?: number | string;
  messages?: Message[];
  onMessagesChange?: (msgs: Message[]) => void;
}

const StreamChatModal: React.FC<StreamChatModalProps> = ({
  visible,
  onClose,
  defaultRole,
  defaultQuestion,
  width = 400,
  height = 600,
  messages: propMessages,
  onMessagesChange,
}) => {
  const {
    messages,
    inputValue,
    setInputValue,
    isFetching,
    fetchStreamData,
    abortFetch,
  } = useStreamChat({
    initialMessages: propMessages,
    initialRole: defaultRole,
    initialQuestion: defaultQuestion,
    onMessagesChange,
  });

  const messageListRef = useRef<ChatMessageListRef>(null);
  const [autoFocusInput, setAutoFocusInput] = useState(false);

  // 弹窗打开时自动提问
  useEffect(() => {
    if (visible && defaultQuestion) {
      setInputValue(defaultQuestion);
      fetchStreamData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, defaultQuestion]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        width,
        height,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderRadius: 8,
        background: "#fff",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        padding: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            padding: 12,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span>智能对话</span>
          <span style={{ cursor: "pointer", fontSize: 20 }} onClick={onClose}>
            ×
          </span>
        </div>
        {/* 内容区+滚动按钮 */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatMessageList
            ref={messageListRef}
            messages={messages}
            isFetching={isFetching}
          />
          {/* 滚动按钮绝对定位在内容区右下角 */}
          <div
            style={{
              position: "absolute",
              right: 16,
              bottom: 16,
              display: "flex",
              gap: 8,
              zIndex: 10,
            }}
          >
            <button
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 16,
                padding: 4,
                cursor: messageListRef.current?.isAtTop
                  ? "not-allowed"
                  : "pointer",
                color: messageListRef.current?.isAtTop ? "#ccc" : "#1890ff",
                fontSize: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              onClick={() => messageListRef.current?.scrollToTop()}
              disabled={messageListRef.current?.isAtTop}
              title="回到顶部"
            >
              <UpOutlined />
            </button>
            <button
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 16,
                padding: 4,
                cursor: messageListRef.current?.isAtBottom
                  ? "not-allowed"
                  : "pointer",
                color: messageListRef.current?.isAtBottom ? "#ccc" : "#1890ff",
                fontSize: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              onClick={() => messageListRef.current?.scrollToBottom()}
              disabled={messageListRef.current?.isAtBottom}
              title="回到底部"
            >
              <DownOutlined />
            </button>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid #eee",
            padding: 12,
            background: "#fff",
            flexShrink: 0,
          }}
        >
          <ChatInputBar
            inputValue={inputValue}
            setInputValue={setInputValue}
            isFetching={isFetching}
            onFetch={fetchStreamData}
            onAbort={abortFetch}
            autoFocus={autoFocusInput}
            onInputFocus={() => setAutoFocusInput(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default StreamChatModal;
