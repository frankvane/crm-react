# StreamChatModal 组件文档

## 组件简介

StreamChatModal 是一个支持流式对话、消息历史、自动滚动、API 灵活配置的聊天弹窗组件，适用于 AI 聊天、客服、IM 等场景。

## 主要特性

- 支持流式消息输出与自动滚动到底部
- 消息历史分页加载，支持查看更多历史消息
- 支持自定义 API 地址、请求头、参数转换
- 支持多种回调事件（onSuccess、onError、onAbort、onMessage、onMinimize 等）
- 支持自定义 loading、错误渲染
- 视觉风格可定制，适配主流 UI 体系

## 组件属性（Props）

| 属性名             | 类型                              | 默认值 | 说明                                            |
| ------------------ | --------------------------------- | ------ | ----------------------------------------------- |
| visible            | boolean                           | 必填   | 是否显示弹窗                                    |
| onClose            | () => void                        | 必填   | 关闭弹窗回调                                    |
| defaultRole        | string                            | 必填   | 默认角色（如 "user"、"assistant"）              |
| defaultQuestion    | string                            | 必填   | 默认提问内容                                    |
| width              | number \| string                  | 400    | 弹窗宽度                                        |
| height             | number \| string                  | 600    | 弹窗高度                                        |
| messages           | Message[]                         | -      | 消息列表（受控模式）                            |
| onMessagesChange   | (msgs: Message[]) => void         | -      | 消息变更回调（受控模式）                        |
| apiUrl             | string                            | 必填   | 聊天 API 地址                                   |
| apiHeaders         | Record<string, string>            | -      | API 请求头                                      |
| apiParamsTransform | (params: any) => any              | -      | API 参数转换函数                                |
| onSuccess          | (message: Message) => void        | -      | AI 回复完成回调（assistant 消息流式输出结束时） |
| onError            | (error: Error) => void            | -      | 消息发送失败回调                                |
| onAbort            | () => void                        | -      | 消息中断回调                                    |
| onMessage          | (message: Message) => void        | -      | 收到新消息回调（流式片段）                      |
| onMinimize         | (minimized: boolean) => void      | -      | 最小化弹窗回调                                  |
| errorRender        | (error: Error) => React.ReactNode | -      | 自定义错误渲染                                  |
| loadingRender      | () => React.ReactNode             | -      | 自定义 loading 渲染                             |
| pageSize           | number                            | -      | 消息分页大小（每页消息数）                      |

> Message 类型定义：
>
> ```ts
> interface Message {
>   id: number;
>   role: string;
>   content: string;
>   roleName?: string;
>   roleColor?: string;
>   timestamp?: string | number;
> }
> ```

## 使用示例

### 基础用法示例

```tsx
import StreamChatModal from "./StreamChatModal";

<StreamChatModal
  visible={true}
  onClose={() => {}}
  defaultRole="user"
  defaultQuestion="你好，AI！"
  apiUrl="/api/chat"
/>;
```

### 完整用法示例

```tsx
import StreamChatModal from "./StreamChatModal";

<StreamChatModal
  visible={true}
  onClose={() => console.log("关闭弹窗")}
  defaultRole="user"
  defaultQuestion="请帮我写一段 React 代码"
  width={500}
  height={700}
  apiUrl="/api/chat"
  apiHeaders={{ Authorization: "Bearer token" }}
  apiParamsTransform={(params) => ({ ...params, userId: 123 })}
  onSuccess={(msg) => console.log("AI 回复", msg)}
  onError={(err) => alert("出错了: " + err.message)}
  onMessage={(msg) => console.log("流式片段", msg)}
  onAbort={() => console.log("请求被中断")}
  onMinimize={(minimized) => console.log("窗口最小化", minimized)}
  errorRender={(err) => (
    <div style={{ color: "red" }}>自定义错误：{err.message}</div>
  )}
  loadingRender={() => <div>自定义 Loading...</div>}
  pageSize={5}
  messages={[]}
  onMessagesChange={(msgs) => console.log("消息变更", msgs)}
/>;
```

## 常见问题与注意事项

- 聊天 API 返回格式需为 `{ code, message, data }`。
- 支持流式输出（如 SSE、Fetch 流），需后端接口配合。
- 消息区自动滚动到底部，历史消息分页加载。
- 详细更新日志请见项目根目录 `UPDATE.md`。

## 更新日志

- 详见项目根目录 `UPDATE.md`。
