import { Avatar, Divider, Space } from "antd";

import type { Message } from "./types";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { UserOutlined } from "@ant-design/icons";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface ChatMessageItemProps {
  msg: Message;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ msg }) => {
  return (
    <div style={{ marginBottom: 20 }}>
      <Space>
        <Avatar
          icon={<UserOutlined />}
          style={{
            backgroundColor:
              msg.role === "user"
                ? "#1890ff"
                : msg.role === "assistant"
                ? msg.roleColor
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
