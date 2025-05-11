# 更新日志

## 2024-06-09

- ChatMessageList.tsx 顶部增加"查看更多历史消息"按钮，点击后每次加载 3 条历史消息，并在每条消息前加上索引编号以便调试。
- ChatMessageList.tsx 调整"查看更多历史消息"按钮的渲染逻辑，只要消息总数大于 PAGE_SIZE，按钮就一直显示，但点到头不会再加载更多。
- ChatMessageList.tsx 移除滚动到顶部时自动加载历史消息的逻辑，现在只有点击"查看更多历史消息"按钮时才会加载更多历史消息。
- ChatMessageList.tsx 禁止出现横向滚动条，给外层容器样式加上 overflowX: 'hidden'。
- FileUploader 组件新增 `apiPrefix` 属性，支持自定义 API 前缀，并已透传到 useFileUploadQueue，提升了接口灵活性和可配置性。
- ProductCardWrapper 组件新增 `renderCartAction` 和 `renderWishlistAction` 两个 props，支持自定义渲染购物车和心愿单操作内容（如 icon、svg、自定义按钮等）。如未传递，仍使用默认按钮。
- 物流演示页（goods-order/logistics/index.tsx）增加了 ProductCardWrapper 组件 renderCartAction 和 renderWishlistAction 的自定义渲染用法示例，演示如何用 icon/svg/自定义内容替换默认按钮，便于开发者参考和二次开发。
- 新增 `src/components/ProductCard/README.md`，系统整理 ProductCard 及 ProductCardWrapper 的标准用法、插槽/复合结构最佳实践、props 说明、典型用法示例、常见问题与注意事项。
- ProductCard 组件支持 Section 通用插槽（ProductCard.Section），可通过 name 自定义分区，实现商品简介、店铺、促销等任意内容插入，提升复合结构灵活性。
- renderActions 参数扩展为 ProductCardActionContext，支持传递商品上下文、children、productData、extra 等，允许渲染任意自定义按钮。
- README.md 补充 Section 插槽和 renderActions 扩展用法及最佳实践示例。
- 【ProductCard 文档完善】
  - 从 src/pages/goods-order/logistics/index.tsx 补充了 ProductCardWrapper 只用 props、只用 children、自定义操作按钮的标准用法示例。
  - 完善了 props/children 优先级说明，明确 props 和 children 不可混用，避免重复渲染。
  - 完善了 ProductCard Section 插槽与 renderActions 扩展用法示例，结构与 index.tsx 保持一致。
  - 每个示例前增加了简要说明，便于开发者理解。
  - 明确 props、插槽、children 的优先级和注意事项。

## 2024-06-09

- ChatMessageList.tsx 实现分段渲染+懒加载，PAGE_SIZE=3。初始只渲染最新 3 条消息，用户上滑到顶部时每次多加载 3 条。

## 2024-06-12

- useNetworkType、useFileUploadQueue、utils.ts 全部方法补充/规范了 jsdoc 注释，提升代码可读性和团队协作效率。
- 其它细节优化见代码。
- StreamChatModal 智能对话框整体视觉优化：加深边框色（border: 1.5px solid #e0e0e0）、增强阴影（boxShadow: 0 4px 24px rgba(0,0,0,0.18)）、圆角 10。
- 标题区顶部新增品牌色渐变条，提升辨识度。
- 标题区底部分割线加深，与整体风格统一。
- 修复 useStreamChat.ts 递归 setState 导致的 Maximum update depth exceeded 报错：useEffect 里用 useRef 跳过首次渲染，彻底避免 onMessagesChange 递归死循环，提升健壮性。
- StreamChatModal 聊天消息区滚动到顶部/底部时增加平滑动画（smooth behavior），提升滚动体验。
- StreamChatModal 目录结构优化：新增 hooks 子目录并迁移 useStreamChat.ts，修正相关导入路径，提升可维护性和规范性。

## 2025-05-08

- 抽离上传相关工具函数（checkFileBeforeUpload、createFileChunks、calcFileMD5WithWorker）到 src/components/FileUploader/utils.ts，提升代码复用性和可维护性。
- 抽离网络类型检测与并发数映射逻辑为 hooks/useNetworkType，自适应网络变化，提升组件解耦性与可维护性。
- useNetworkType 重构为基于 ahooks useNetwork 的二次封装，支持 rtt/effectiveType 等，简化实现。
- useNetworkType 的 concurrency 计算方式改为基于 rtt 动态判断，移除网络类型映射表，提升并发自适应性。

## 2024-06-10

- 修复 FileUploader 组件中断上传功能：新增 stoppedRef 全局标记，handleStop 时彻底阻断所有后续分片上传，确保中断操作立即生效，所有请求都能被终止。

- 修复 FileUploader 组件暂停功能：现在点击暂停时会立即中断所有正在进行的分片上传请求（调用 AbortController.abort），确保暂停操作真正生效，用户体验更好。

- FileUploader 组件新增本地存储上传进度和自动恢复提示功能：

  - 上传分片成功后将 fileId、md5、文件名、已上传分片索引等信息实时存入 localStorage。
  - 组件初始化时自动检测 localStorage 是否有未完成上传任务，弹窗提示用户是否恢复。
  - 恢复时自动跳过已完成分片，上传完成/中断/重置时自动清理本地进度。

- 修复 FileUploader 中断上传功能，handleStop 只标记 stopped，不再 setTimeout 删除 fileStates，所有分片上传/进度回调/handleStart 等流程都判断 stopped，只有上传完成或用户主动移除时才清理 fileStates。

- 修复 pendingChunks 为空时直接 merge 导致分片不存在报错的问题。queue.push 前判断 pendingChunks.length，只有所有分片都已上传才允许 merge，否则提示错误。

## 2024-06-10

- 修复 `src/components/FileUploader/index.tsx` 分片上传时 `cb is not a function` 的 bug。原因是 async.eachLimit 的 worker 用 async 函数并 return cb()，导致 cb 被错误处理为 Promise。现已改为普通函数并用 Promise 处理异步，彻底解决该问题。

## 2024-06-09

- 修复断点续传时 chunkSize 变化导致的分片数量异常问题。
- 现在每个文件的 chunkSize 会在首次上传时记录，后续 resume 时强制使用相同 chunkSize，保证分片数量一致。

## 2024-06-09

- 彻底移除断点续传和恢复上传相关功能：
  - 删除 useUploadResume.ts 和 ResumeUploadModal.tsx 文件。
  - FileUploader 组件移除所有恢复上传相关 UI 和逻辑。
  - useFileUploadQueue 彻底移除 stopped 状态和 handleResume 相关代码。
  - FileUploadCard 组件不再渲染任何恢复上传按钮。

## 2024-06-09

- 优化上传组件：中断上传后文件卡片不再消失，支持点击"恢复上传"按钮重新上传。
- handleStop 现在只标记 stopped 状态，不会移除 fileStates 和 files，断点信息保留。
- handleStart 支持 stopped 状态下重新启动上传。
- FileUploadCard UI 增加"恢复上传"按钮，stopped 状态下可恢复。

## 2024-06-09

- 完善 `src/components/FileUploader/index.tsx`，实现大文件上传主流程：支持 MD5 秒传、断点续传、分片、并发上传、失败重试、暂停/恢复/中断、进度展示、动态切片和并发数调整，UI 联动，集成 request 统一请求。

## 2024-06-09

- 新增 `src/components/FileUploader/index.tsx`，实现大文件上传 UI 骨架，包含 Antd Upload、Progress、Button 等，预留上传、暂停、恢复、中断等核心方法和状态。

## 2024-06-09

- 新增 `src/components/FileUploader/utils.ts`，封装切片、MD5 计算（worker 通信）、分片重试、进度计算等核心工具函数骨架。

## 2024-06-09

- 新增 `src/components/FileUploader/worker-md5.js`，基于 spark-md5 实现 webworker 文件 MD5 计算，提升大文件处理性能。

## 2024-06-09

- FileUploader 组件重构：每个文件上传/暂停/恢复/中断按钮只影响自己，彻底移除全局 uploading/paused/md5/totalChunks/uploadingChunks 状态，所有上传相关状态都放到 fileStates 里。
- handleStart/handlePause/handleResume/handleStop 都传 file 参数并只影响对应文件。
- 上传全部按钮依然支持批量上传。

## 2024-06-09

- FileUploader 组件切片大小输入框和显示优化为 MB 单位，文件名下方新增文件大小（MB）显示，提升用户体验。

## 2024-06-09

- 修复 FileUploader 秒传确认后 return 逻辑，避免后续多余操作；上传完成（含秒传）后自动重置所有状态，提升用户体验。

## 2024-06-09

- 修正 FileUploader 秒传确认判断，uploaded 字段路径改为 checkRes.data.data.uploaded，彻底避免同一文件重复上传。

## 2024-06-09

- FileUploader 组件并发上传逻辑由 async.queue 替换为 async.js 的 eachLimit 填补式并发，提升上传效率与带宽利用率。

## 2024-06-09

- 修复并发上传相关 linter 警告。

## 2024-06-09

- 将 useDynamicUploadConfig 移动到 src/components/FileUploader/hooks 目录，保持业务相关 hooks 内聚，便于维护。

## [0.2.2] - 2025-05-05

### 全局 loading 计数器方案

- 全局 loading 升级为计数器方案，支持多请求并发场景，避免 loading 闪烁或提前消失。
- 计数器方案是业界通用的全局 loading 管理方式，因为它能精确追踪所有并发请求的开始与结束，只有全部请求完成后 loading 才会消失，保证用户体验一致性。相比单一 boolean 方案，计数器能有效避免多个请求并发时 loading 过早消失或反复闪烁的问题，适用于中大型前端项目。

## [0.2.1] - 2025-05-05

### 路由与目录结构重构

- 登录页路由由 `/user/login` 统一调整为 `/login`，所有相关跳转、重定向、权限守卫、request 拦截器等代码已同步更新。
- 登录页目录由 `src/pages/user/Login` 移动为 `src/pages/login`，并删除空的 `user` 目录，import 路径已全部适配。
- 规范了全局 loading 和错误边界组件的目录结构，提升项目可维护性。

## [0.2.0] - 2025-05-04

### 新增

- TabBar 标签页功能，支持多标签浏览、关闭、切换、批量管理
- keepalive-for-react 页面缓存，提升页面切换体验
- 分类管理功能增强，支持分类类型与分类的增删改查
- 资源操作管理功能，支持资源按钮级权限配置
- 按钮权限控制，应用于分类、资源、角色和用户管理页面
- 动态路由递归与重定向，支持三段式动态路由生成
- 支持 vite-plugin-cdn-import/CDN 加载部分依赖，优化生产环境构建体积

### 优化

- TabBar 与路由状态完全同步，切换/关闭标签页自动跳转
- 仪表盘标签页固定且不可关闭，保证主入口稳定
- 分类和分类类型组件响应结构优化，移除冗余包装，统一数据访问
- 资源管理页面优化，支持树形结构展示和图标选择
- 角色分配、资源分配、按钮权限分配等交互体验优化
- 响应拦截器和 API 返回类型统一，前后端字段命名规范化
- 登录、退出登录、路由跳转等流程体验提升
- 代码格式、导入顺序、组件结构和状态管理优化

### 修复

- 修复 keepalive 页面缓存失效，切换后表单/输入内容不丢失
- 修复 TabBar 关闭逻辑异常，保证关闭后自动切换到合适的标签
- 修复动态菜单 key 与路由 path 对齐，保证菜单正常显示和跳转
- 修复页面刷新跳转问题，优化 AuthGuard 认证逻辑
- 修复部分 API 响应与前端类型不一致问题
- 修复类型推断、类型定义、类型警告等 TypeScript 相关问题
- 修复登录状态和侧边栏样式
- 修复分类树、分类列表、资源表单等数据类型和显示问题
- 修复登录失败时的错误处理

### 重构

- 路由结构统一迁移到 router 目录，支持静态/动态/三段式路由生成
- 分类表单父级分类与类型解耦，减少无关请求
- 优化表单逻辑，移除冗余代码
- 资源管理、角色管理、用户管理等页面结构和状态管理优化

### 文档

- 完善命名规范、模型关联、操作流程、RBAC 权限、API 等文档
- 更新日志日期修正，历史版本请见旧日志

## [0.1.4] - 2024-05-02

### 优化

- 优化标签页（TabBar）功能
  - 修复仪表盘标签页始终存在且不可关闭
  - 优化标签页关闭逻辑，关闭当前标签页后自动切换到上一个标签页
  - 确保标签页与路由同步，提升用户体验
  - 修复标签页管理功能（关闭其他、关闭左侧、关闭右侧、关闭全部）

## [0.1.3] - 2024-05-02

### 优化

- 优化分类和分类类型组件的响应结构
  - 移除 `IResponse` 包装器
  - 更新组件以适应新的响应结构
  - 修复分类和分类类型管理的数据获取和显示

## [0.1.2] - 2024-05-01

### 优化

- 优化响应拦截器和 API 返回类型
  - 移除 `IResponse` 包装器
  - 更新角色和资源管理组件以适应新的响应结构
  - 修复资源列表获取功能，使用真实 API 数据

## [0.1.1] - 2024-05-01

### 修复

- 修复 TypeScript 项目配置问题
  - 添加 `"composite": true` 和 `"emitDeclarationOnly": true` 到 `tsconfig.node.json`
  - 解决项目引用配置错误

## [0.1.0] - 2024-05-01

### 新增

- 添加用户管理功能
  - 实现用户列表展示
  - 实现用户创建和编辑
  - 实现用户状态切换
  - 支持多角色分配

### 优化

- 优化响应处理
  - 统一错误处理
  - 简化数据访问
  - 完善类型定义

### Git 提交记录获取

```bash
git log --pretty=format:"%h - %an, %ad : %s" > commit_messages.txt
```

```bash
npx @agentdeskai/browser-tools-server@1.2.0
```

## 2024-06-09

- 修复所有 setFileStates 相关回调中 state 可能为 undefined 的判空，彻底解决 TypeError。
- 修复上传中断后，fileStates[fileKey] 可能为 undefined 导致的 TypeError，所有 merge 前判断都加了判空，避免报错。

## 2024-06-09

- 移除上传中断后的恢复功能。中断后文件卡片直接消失，无法恢复上传。
- FileUploadCard 组件移除"恢复上传"按钮。
- handleStop 直接移除 fileStates 和 files。

## 2024-06-09

- 修复：实现了上传暂停后的恢复功能，新增 handleResume 方法，并将"恢复"按钮正确绑定到该方法，支持分片上传的断点续传。

## 2024-06-09

- 【修复&优化】重构文件上传的暂停、继续、停止功能：
  - 暂停时只暂停 queue，不 abort 当前分片，保证分片不丢失。
  - 恢复时只 resume queue，不重新走 handleStart，避免重复上传和状态错乱。
  - 中断时 kill queue 并 abort 所有请求，UI 延迟移除，彻底清理 fileStates 和 localStorage。
  - controllers 与 queue 任务一一对应，所有异步回调都判空 fileStates，防止幽灵回调。
  - 增加注释，保证逻辑清晰。

## 2024-06-09

- 【修复】修正暂停/继续上传后分片数量异常问题：
  - 恢复/继续上传时 chunkSize 只能用 fileStates 里已记录的 chunkSize，禁止变动，彻底解决分片数量不一致导致的进度丢失和上传卡死。
  - 有文件正在上传/暂停时，禁用切片大小和并发数配置，防止用户误操作。

## 2024-06-09

- 全新重构 `src/components/FileUploader/hooks/useFileUploadQueue.ts`，实现如下功能：
  - 支持分片上传、断点续传、秒传、进度回调、并发控制、暂停/恢复/中断、UI 消息回调
  - 所有后端接口返回统一 `{ code, message, data }` 格式
  - 复用 utils 和 services 目录下工具函数与接口

## 2024-06-11

- `src/components/FileUploader/index.tsx` 新增网络自适应与失败重试优化：
  - 根据当前网络类型（navigator.connection.effectiveType）动态调整最大并发上传数（如 4G/5G 为 3，WiFi 为 5，2G/3G 为 1）。
  - 分片上传失败时，支持自适应重试（如网络较差时自动延长重试间隔，最多重试 5 次）。
  - UI 显示当前网络类型和并发数，便于用户感知。
  - 代码结构清晰，便于后续扩展。

## 2024-06-11

- `src/components/FileUploader/index.tsx` 新增上传速度统计与剩余时间预估功能：
  - 每个文件上传时实时统计速率（MB/s）和剩余时间（秒），并在进度条下方展示。
  - 支持批量上传时统计总速率。
  - 速率采用滑动窗口平均，避免抖动。
  - 代码结构清晰，便于后续扩展。

## 2024-06-11

- `src/components/FileUploader/index.tsx` 错误提示与交互优化：
  - 分片上传/合并失败时，记录详细错误信息到 state，并在 UI 上通过 Modal 或 Tooltip 展示。
  - 失败文件显示"重试"按钮，点击后可单独重试上传该文件。
  - 批量上传时，若有失败文件，支持一键重试所有失败文件。
  - 进度条和 Tag 根据状态高亮显示错误。
  - 代码结构清晰，便于后续扩展。

## 2024-06-11

- `src/components/FileUploader/index.tsx` 后台任务恢复与断点续传增强：
  - 上传分片成功后，将 fileId、md5、文件名、已上传分片索引等信息实时存入 localStorage。
  - 组件初始化时自动检测 localStorage 是否有未完成上传任务，弹窗提示用户是否恢复。
  - 恢复时自动跳过已完成分片，仅上传剩余分片，支持断点续传。
  - 上传完成/中断/重置时自动清理本地进度，避免脏数据。
  - UI 增加"恢复上传"提示和入口。
  - 代码结构清晰，便于后续扩展。

## 2024-06-12

- 重构 FileUploader 组件：将文件上传相关请求（checkInstantUpload、getFileStatus、uploadFileChunk、mergeFile）抽离到 api 目录（api/index.ts），原 hooks/api.ts 已删除，所有 API 统一从 api/index.ts 导入，结构更清晰。

## 2024-06-13

修复 StreamChat 聊天消息区滚动条无法自动跟随到底部的问题：移除 shouldAutoScroll 逻辑，messages 或 isFetching 变化时始终自动滚动到底部（流式输出时无动画，结束时 smooth）。提升了用户体验。

StreamChatModal 组件 API 层抽象：支持 apiUrl、apiHeaders、apiParamsTransform 配置，所有请求通过 hooks/useStreamChatApi.ts 统一发起，便于复用和环境切换。修复流式请求中断（abort）功能，fetch 支持 signal，abortFetch 可正常中断流式请求。

StreamChatModal 组件事件/回调机制完善：支持 onSuccess、onError、onAbort、onMessage、onMinimize 等回调，主项目可灵活接管 AI 回复、异常、中断、流式片段、最小化等事件，实现业务联动和体验提升。

StreamChatModal 组件错误处理与 loading 状态统一：支持 errorRender、loadingRender props，主项目可自定义错误和 loading 展示，默认兜底 UI，提升健壮性和可扩展性。

## 2024-06-13

- FileUploader 组件的 apiPrefix 属性现在有默认值：'http://localhost:3000/api'，未传递时自动使用该默认值，便于本地开发和接口统一。

## 2024-06-13

- 补充完善 ProductCard 组件文档：在 props 及插槽/复合结构用法部分，系统说明了 ProductCard.Section 的用法和作用，增加了标准用法示例和详细说明，便于开发者前置理解 Section 插槽能力，提升文档可读性和组件易用性。

## 2024-06-13

- 重构 ProductCardWrapper 组件渲染逻辑：只要有 imageSrc、title、price、badgeType 等 props 之一有值，仅渲染 props 内容，完全忽略 children。只有所有这些 props 都未传递时才渲染 children，彻底避免 props/children 混用导致的重复渲染问题，逻辑更严谨。

## 2024-06-13

- 修复 ProductCard 主组件对子组件重复渲染问题：遍历 children 时，每种类型（Image、Title、Price、Badge）只渲染第一个同类型子组件，后续同类型自动忽略，保证每种类型只渲染一次，彻底避免 props/children 混用导致的重复渲染，逻辑更严谨。

## 2024-06-13

- 递归修复 ProductCard 主组件对子组件唯一性渲染：递归展开所有 children（支持 Fragment/数组嵌套），对 Image、Title、Price、Badge 类型做全量唯一性去重，彻底解决嵌套结构下的重复渲染问题。
