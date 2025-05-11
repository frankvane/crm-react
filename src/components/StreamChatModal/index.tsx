import "github-markdown-css/github-markdown-light.css";
import "antd/dist/reset.css";

import { Alert, Button, Spin, message } from "antd";
import { DownOutlined, MessageOutlined, UpOutlined } from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";

import ChatInputBar from "./ChatInputBar";
import ChatMessageList from "./ChatMessageList";
import type { ChatMessageListRef } from "./ChatMessageList";
import type { Message } from "./types";
import type { StreamChatApiOptions } from "./hooks/useStreamChatApi";
import { useStreamChat } from "./hooks/useStreamChat";

interface StreamChatModalProps extends Omit<StreamChatApiOptions, "signal"> {
  visible: boolean;
  onClose: () => void;
  defaultRole: string;
  defaultQuestion: string;
  width?: number | string;
  height?: number | string;
  messages?: Message[];
  onMessagesChange?: (msgs: Message[]) => void;
  apiUrl: string;
  apiHeaders?: Record<string, string>;
  apiParamsTransform?: (params: any) => any;
  onSuccess?: (message: Message) => void;
  onError?: (error: Error) => void;
  onAbort?: () => void;
  onMessage?: (message: Message) => void;
  onMinimize?: (minimized: boolean) => void;
  errorRender?: (error: Error) => React.ReactNode;
  loadingRender?: () => React.ReactNode;
  pageSize?: number;
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
  apiUrl,
  apiHeaders,
  apiParamsTransform,
  onSuccess,
  onAbort,
  onMessage,
  onMinimize,
  errorRender,
  loadingRender,
  pageSize,
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
    apiUrl,
    apiHeaders,
    apiParamsTransform,
    onSuccess,
    onError: (err) => {
      setError(err);
      if (typeof errorRender !== "function") message.error(err.message);
    },
    onAbort,
    onMessage,
  });

  const messageListRef = useRef<ChatMessageListRef>(null);
  const [autoFocusInput, setAutoFocusInput] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [minimized, setMinimized] = useState(false);
  const bringBtnRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState<Error | null>(null);

  // 弹窗打开时自动提问
  useEffect(() => {
    if (visible && defaultQuestion) {
      setInputValue(defaultQuestion);
      fetchStreamData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, defaultQuestion]);

  useEffect(() => {
    if (!selectedText) return;
    const handleClick = (e: MouseEvent) => {
      if (
        bringBtnRef.current &&
        bringBtnRef.current.contains(e.target as Node)
      ) {
        // 点击了"带入输入框"按钮本身，不清除
        return;
      }
      setSelectedText("");
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selectedText]);

  // 事件回调监听
  // 1. AI回复完成
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "assistant" && !isFetching && onSuccess) {
      onSuccess(lastMsg);
    }
  }, [messages, isFetching, onSuccess]);

  // 2. 流式片段
  // 可根据需要实现更细粒度的流式回调

  // 3. 错误和中断（可在 useStreamChat 内部通过自定义事件或状态提升实现）

  // 错误自动清理（如用户重新输入/提问时）
  useEffect(() => {
    if (!isFetching) return;
    if (error) setError(null);
  }, [isFetching]);

  // 关闭窗口时自动中断流式请求
  const handleClose = () => {
    if (isFetching) abortFetch();
    onClose();
  };

  if (!visible) return null;
  if (minimized) {
    return (
      <div
        style={{
          position: "fixed",
          right: 32,
          bottom: 32,
          zIndex: 2100,
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          padding: 10,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          border: "1.5px solid #e0e0e0",
        }}
        onClick={() => {
          setMinimized(false);
          if (onMinimize) onMinimize(false);
        }}
        title="展开对话"
      >
        <MessageOutlined style={{ fontSize: 24, color: "#1890ff" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        width,
        height,
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        border: "1.5px solid #e0e0e0",
        borderRadius: 10,
        background: "#fff",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        padding: 0,
      }}
    >
      <div
        style={{
          height: 4,
          width: "100%",
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          background: "linear-gradient(90deg, #ccc 0%, #fff 100%)",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div
          style={{
            // 从上到下渐变，颜色浅蓝到一点点蓝
            background: "linear-gradient(to bottom, #ccc 0%, #fff 100%)",
            padding: 12,
            borderBottom: "1.5px solid #e0e0e0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span>智能对话</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{ cursor: "pointer", fontSize: 20 }}
              onClick={() => {
                setMinimized(true);
                if (onMinimize) onMinimize(true);
              }}
              title="最小化"
            >
              –
            </span>
            <span
              style={{ cursor: "pointer", fontSize: 20 }}
              onClick={handleClose}
              title="关闭"
            >
              ×
            </span>
          </div>
        </div>
        {/* 内容区+控制按钮区 */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 错误展示 */}
          {error &&
            (errorRender ? (
              errorRender(error)
            ) : (
              <Alert
                type="error"
                message={error.message}
                showIcon
                style={{ margin: 12 }}
              />
            ))}
          {/* loading 展示 */}
          {isFetching && !error && loadingRender && loadingRender()}
          {/* 消息列表 */}
          <ChatMessageList
            ref={messageListRef}
            messages={messages}
            isFetching={isFetching}
            onScrollStatusChange={({ isAtTop, isAtBottom }) => {
              setIsAtTop(isAtTop);
              setIsAtBottom(isAtBottom);
            }}
            onSelectText={setSelectedText}
            pageSize={pageSize}
          />
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "rgba(255,255,255,0.96)",
              borderTop: "1px solid #eee",
              zIndex: 20,
              flexShrink: 0,
            }}
          >
            {selectedText && !isFetching && (
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  marginRight: 8,
                }}
              >
                <Button
                  ref={bringBtnRef}
                  onClick={() => {
                    setInputValue((prev) =>
                      prev ? prev + "\n" + selectedText : selectedText
                    );
                    setSelectedText("");
                    setAutoFocusInput(true);
                  }}
                  type="primary"
                  size="small"
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  带入输入框
                </Button>
              </div>
            )}
            <button
              style={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 16,
                padding: 4,
                cursor: isAtTop || isFetching ? "not-allowed" : "pointer",
                color: isAtTop || isFetching ? "#ccc" : "#1890ff",
                fontSize: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              onClick={() => messageListRef.current?.scrollToTop()}
              disabled={isAtTop || isFetching}
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
                cursor: isAtBottom || isFetching ? "not-allowed" : "pointer",
                color: isAtBottom || isFetching ? "#ccc" : "#1890ff",
                fontSize: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              onClick={() => messageListRef.current?.scrollToBottom()}
              disabled={isAtBottom || isFetching}
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
