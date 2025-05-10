import { StreamChatApiOptions, fetchStreamChat } from "./useStreamChatApi";
import { useEffect, useRef, useState } from "react";

import type { Message } from "../types";

interface UseStreamChatOptions {
  initialMessages?: Message[];
  initialRole: string;
  initialQuestion?: string;
  onMessagesChange?: (msgs: Message[]) => void;
}

export function useStreamChat(
  options: UseStreamChatOptions & StreamChatApiOptions
) {
  const {
    initialMessages = [],
    initialRole,
    initialQuestion = "",
    onMessagesChange,
  } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState<string>(initialQuestion);
  const [role, setRole] = useState<string>(initialRole);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFirst = useRef(true);

  // 消息变更时回调父组件
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  const fetchStreamData = async () => {
    if (!inputValue.trim()) return;
    setIsFetching(true);
    const userMessage: Message = {
      role: "user",
      content: inputValue,
      id: Date.now(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const params = {
        messages: [
          { role: "system", content: `你是一名专业的${role}` },
          ...messages,
          userMessage,
        ],
      };
      const response = await fetchStreamChat(params, {
        apiUrl: options.apiUrl,
        apiHeaders: options.apiHeaders,
        apiParamsTransform: options.apiParamsTransform,
        signal: controller.signal,
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        id: Date.now() + 1,
        roleName: role,
        roleColor: undefined,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        assistantMessage.content += new TextDecoder().decode(chunk);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: assistantMessage.content }
              : msg
          )
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: "[用户请求中断]",
            id: Date.now(),
            timestamp: Date.now(),
          },
        ]);
      }
    } finally {
      setIsFetching(false);
      abortControllerRef.current = null;
    }
  };

  const abortFetch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsFetching(false);
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    setMessages,
    inputValue,
    setInputValue,
    role,
    setRole,
    isFetching,
    fetchStreamData,
    abortFetch,
  };
}
