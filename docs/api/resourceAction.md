# 资源操作管理接口文档

## 概述

资源操作(ResourceAction)是指针对特定资源的具体操作，如"新增"、"编辑"、"删除"等按钮级操作。
每个资源操作必须关联到一个具体的资源(Resource)，系统会为每个资源操作自动创建对应的权限。

## 1. 创建资源操作

- **接口**：`POST /api/resource-actions`
- **描述**：创建新资源操作（需要 system:resource:add 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：

  ```json
  {
    "name": "string", // 操作名称，如"新增"、"编辑"、"删除"
    "code": "string", // 操作代码，如"add"、"edit"、"delete"
    "description": "string", // 操作描述
    "icon": "string", // 图标
    "sort": "number", // 排序号
    "needConfirm": "boolean", // 是否需要确认
    "confirmMessage": "string", // 确认消息
    "resourceId": "number" // 关联的资源ID（必填）
  }
  ```

- **重要说明**：

  - `resourceId` 是必填字段，指定该操作属于哪个资源
  - 系统会自动为每个资源操作创建一个对应格式的权限记录

- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "新增",
      "code": "system:user:add", // 自动组合为 resourceCode:actionCode
      "description": "新增用户",
      "icon": "plus",
      "sort": 1,
      "needConfirm": false,
      "confirmMessage": null,
      "resourceId": 2,
      "permission": {
        "id": 10,
        "name": "system:user:add",
        "code": "system:user:add",
        "description": "新增用户"
      }
    }
  }
  ```

## 2. 获取资源操作列表

- **接口**：`GET /api/resource-actions`
- **描述**：获取所有资源操作（需要 system:resource:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **查询参数**：
  - `resourceId` (可选): 筛选特定资源的操作
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "新增",
        "code": "system:user:add",
        "description": "新增用户",
        "icon": "plus",
        "sort": 1,
        "needConfirm": false,
        "confirmMessage": null,
        "resourceId": 2,
        "resource": {
          "id": 2,
          "name": "用户管理",
          "code": "system:user"
        },
        "permission": {
          "id": 10,
          "name": "system:user:add",
          "code": "system:user:add"
        }
      }
    ]
  }
  ```

## 3. 获取单个资源操作

- **接口**：`GET /api/resource-actions/:id`
- **描述**：获取指定资源操作详情（需要 system:resource:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "新增",
      "code": "system:user:add",
      "description": "新增用户",
      "icon": "plus",
      "sort": 1,
      "needConfirm": false,
      "confirmMessage": null,
      "resourceId": 2,
      "resource": {
        "id": 2,
        "name": "用户管理",
        "code": "system:user"
      },
      "permission": {
        "id": 10,
        "name": "system:user:add",
        "code": "system:user:add"
      }
    }
  }
  ```

## 4. 更新资源操作

- **接口**：`PUT /api/resource-actions/:id`
- **描述**：更新指定资源操作（需要 system:resource:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：

  ```json
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "icon": "string",
    "sort": "number",
    "needConfirm": "boolean",
    "confirmMessage": "string"
  }
  ```

- **注意**：更新操作不允许修改 resourceId

- **响应**：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "编辑",
      "code": "system:user:edit",
      "description": "编辑用户",
      "icon": "edit",
      "sort": 2,
      "needConfirm": false,
      "confirmMessage": null,
      "resourceId": 2,
      "permission": {
        "id": 10,
        "name": "system:user:edit",
        "code": "system:user:edit"
      }
    }
  }
  ```

## 5. 删除资源操作

- **接口**：`DELETE /api/resource-actions/:id`
- **描述**：删除指定资源操作（需要 system:resource:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：

  ```json
  {
    "success": true,
    "message": "Resource action deleted successfully"
  }
  ```

- **特别说明**：删除资源操作会同时删除关联的权限
