# FileUploader 组件接口文档

## 1. 组件 Props

```ts
interface FileUploaderProps {
  accept?: string; // 允许上传的文件类型，默认图片类型
  maxSizeMB?: number; // 单文件最大体积（MB），默认10
  multiple?: boolean; // 是否支持多文件上传，默认false
}
```

## 2. 组件核心方法与状态

### useFileUploadQueue Hook

#### 参数

```ts
interface UseFileUploadQueueProps {
  chunkSize: number; // 分片大小（字节）
  concurrent: number; // 并发上传数
  setFiles: Dispatch<SetStateAction<File[]>>; // 文件列表 setter
  onMessage?: (msg: UploadMessage) => void; // 消息回调（UI 交互）
}
```

#### 返回值

```ts
interface UseFileUploadQueueResult {
  fileStates: Record<string, FileUploadState>; // 各文件上传状态
  setFileStates: Dispatch<SetStateAction<Record<string, FileUploadState>>>;
  handleStart: (file: File, chunkSizeParam?: number) => Promise<void>; // 单文件上传
  handleStartAll: (files: File[]) => Promise<void>; // 批量上传
}
```

#### FileUploadState 说明

```ts
interface FileUploadState {
  md5?: string; // 文件MD5
  chunkMD5s?: string[]; // 分片MD5数组
  chunkSize?: number; // 分片大小
  uploading?: boolean; // 是否正在上传
  totalChunks?: number; // 总分片数
  uploadingChunks?: number; // 已上传分片数
  progress?: number; // 上传进度（百分比）
  queue?: any; // 内部上传队列对象
}
```

#### UploadMessage 说明

```ts
interface UploadMessage {
  type: "loading" | "success" | "warning" | "error";
  content: string;
  key?: string;
  duration?: number;
}
```

---

## 3. 组件事件与回调

- `onStart(file: File)`：开始上传指定文件。
- `onStartAll(files: File[])`：批量上传所有文件。
- `onMessage(msg: UploadMessage)`：上传过程中的消息通知（如进度、错误、成功等）。

---

## 4. 与后端接口交互格式

所有后端接口返回格式需满足如下结构：

```json
{
  "code": 200,
  "message": "ok",
  "data": { ... }
}
```

### 4.1 秒传检测

- **接口**：`POST /file/instant`
- **参数**：

  ```json
  {
    "file_id": "md5-文件名-文件大小",
    "md5": "文件MD5",
    "name": "文件名",
    "size": 123456,
    "total": 10,
    "chunk_md5s": ["分片1MD5", "分片2MD5", ...]
  }
  ```

- **返回**：

  ```json
  {
    "code": 200,
    "message": "ok",
    "data": {
      "uploaded": true,
      "chunkCheckResult": [
        { "index": 0, "exist": true, "match": true },
        ...
      ]
    }
  }
  ```

### 4.2 获取分片状态

- **接口**：`GET /file/status`
- **参数**：

  ```
  ?file_id=xxx&md5=xxx
  ```

- **返回**：

  ```json
  {
    "code": 200,
    "message": "ok",
    "data": {
      "chunks": [0, 1, 2, ...]
    }
  }
  ```

### 4.3 上传分片

- **接口**：`POST /file/upload`
- **参数**：`FormData` 格式

  ```
  file_id: string
  md5: string
  index: number
  chunk: Blob
  name: string
  total: number
  ```

- **返回**：

  ```json
  {
    "code": 200,
    "message": "ok",
    "data": {}
  }
  ```

### 4.4 合并分片

- **接口**：`POST /file/merge`
- **参数**：

  ```json
  {
    "file_id": "xxx",
    "md5": "xxx",
    "name": "xxx",
    "size": 123456,
    "total": 10
  }
  ```

- **返回**：

  ```json
  {
    "code": 200,
    "message": "ok",
    "data": {}
  }
  ```

---

## 5. 典型用法示例

```tsx
<FileUploader accept=".png,.jpg" maxSizeMB={20} multiple />
```

---

如需更详细的参数说明、扩展功能或二次开发建议，请随时联系前端开发同学。
