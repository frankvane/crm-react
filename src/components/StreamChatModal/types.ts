// 消息类型声明
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  id: number;
  roleName?: string;
  roleColor?: string;
}
