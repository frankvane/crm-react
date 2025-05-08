# 更新日志

## 2024-06-10

- 修复 FileUploader 组件中断上传功能：新增 stoppedRef 全局标记，handleStop 时彻底阻断所有后续分片上传，确保中断操作立即生效，所有请求都能被终止。

- 修复 FileUploader 组件暂停功能：现在点击暂停时会立即中断所有正在进行的分片上传请求（调用 AbortController.abort），确保暂停操作真正生效，用户体验更好。

- FileUploader 组件新增本地存储上传进度和自动恢复提示功能：

  - 上传分片成功后将 fileId、md5、文件名、已上传分片索引等信息实时存入 localStorage。
  - 组件初始化时自动检测 localStorage 是否有未完成上传任务，弹窗提示用户是否恢复。
  - 恢复时自动跳过已完成分片，上传完成/中断/重置时自动清理本地进度。

- 修复 FileUploader 中断上传功能，handleStop 只标记 stopped，不再 setTimeout 删除 fileStates，所有分片上传/进度回调/handleStart 等流程都判断 stopped，只有上传完成或用户主动移除时才清理 fileStates。

## 2024-06-10

- 修复 `src/components/FileUploader/index.tsx` 分片上传时 `cb is not a function` 的 bug。原因是 async.eachLimit 的 worker 用 async 函数并 return cb()，导致 cb 被错误处理为 Promise。现已改为普通函数并用 Promise 处理异步，彻底解决该问题。

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
