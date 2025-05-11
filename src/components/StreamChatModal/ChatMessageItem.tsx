import { Avatar, Space } from "antd";
import { Tooltip, message as antdMessage } from "antd";

import { CopyOutlined } from "@ant-design/icons";
import type { Message } from "./types";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface ChatMessageItemProps {
  msg: Message;
  index: number;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ msg, index }) => {
  const [hover, setHover] = React.useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      antdMessage.success("已复制");
    } catch {
      antdMessage.error("复制失败");
    }
  };
  return (
    <div
      style={{ marginBottom: 20, position: "relative" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* 复制按钮 */}
      {hover && (
        <Tooltip title="复制" placement="left">
          <CopyOutlined
            onClick={handleCopy}
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              fontSize: 16,
              color: "#999",
              cursor: "pointer",
              zIndex: 2,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1890ff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
          />
        </Tooltip>
      )}
      <Space>
        <span
          style={{
            color: "#aaa",
          }}
        >
          [{index}]
        </span>
        <Avatar
          icon={<UserOutlined />}
          style={{
            // assistant 的背景色是绿色
            backgroundColor:
              msg.role === "user"
                ? "#1890ff"
                : msg.role === "assistant"
                ? "#4eb609"
                : "#f5222d",
          }}
        />
        <span>
          {msg.role === "user"
            ? "我"
            : msg.role === "assistant"
            ? msg.roleName
            : "系统"}
        </span>
        {msg.timestamp && (
          <span style={{ marginLeft: 12, fontSize: 12, color: "#bbb" }}>
            {dayjs(msg.timestamp).format("YYYY-MM-DD HH:mm:ss")}
          </span>
        )}
      </Space>
      <div style={{ marginTop: 12 }}></div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: (({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                {...(props as any)}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }) as React.FC<any>,
        }}
      >
        {msg.content}
      </ReactMarkdown>
    </div>
  );
};

export default ChatMessageItem;
