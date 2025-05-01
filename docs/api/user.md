# 用户管理接口文档

## 1. 创建用户

- **接口**：`POST /api/users`
- **描述**：创建新用户（需要 system:user:add 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string",
    "roleIds": "number[]"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "data": {
      "id": "number",
      "username": "string",
      "email": "string",
      "status": "number",
      "createdAt": "string",
      "updatedAt": "string",
      "roles": [ ... ]
    }
  }
  ```
- **错误**：
  - 400: "Username already exists"
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 500: "Internal Server Error"

## 2. 获取用户列表

- **接口**：`GET /api/users`
- **描述**：获取用户列表（需要 system:user:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - page: 页码（默认：1）
  - pageSize: 每页数量（默认：10）
  - search: 搜索关键词
- **响应**：
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "list": [ ... ],
      "pagination": {
        "current": "number",
        "pageSize": "number",
        "total": "number"
      }
    }
  }
  ```
- **错误**：
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 500: "Internal Server Error"

## 3. 获取单个用户

- **接口**：`GET /api/users/:id`
- **描述**：获取指定用户信息（需要 system:user:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "id": "number",
      "username": "string",
      "email": "string",
      "status": "number",
      "createdAt": "string",
      "updatedAt": "string",
      "roles": [ ... ]
    }
  }
  ```
- **错误**：
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 404: "User not found"
  - 500: "Internal Server Error"

## 4. 更新用户

- **接口**：`PUT /api/users/:id`
- **描述**：更新指定用户信息（需要 system:user:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string",
    "status": "number",
    "roleIds": "number[]"
  }
  ```
- **响应**：与获取单个用户接口相同
- **错误**：
  - 400: "Username already exists"
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 404: "User not found"
  - 500: "Internal Server Error"

## 5. 删除用户

- **接口**：`DELETE /api/users/:id`
- **描述**：删除指定用户（需要 system:user:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "User deleted successfully",
    "data": null
  }
  ```
- **错误**：
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 404: "User not found"
  - 500: "Internal Server Error"

## 6. 修改用户密码

- **接口**：`PUT /api/users/:id/password`
- **描述**：修改指定用户的密码（用户本人或管理员）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "currentPassword": "string", // 当前用户修改自己的密码时需要提供
    "newPassword": "string"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "data": null
  }
  ```
- **错误**：
  - 400: "Current password is incorrect"
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "You can only change your own password"
  - 404: "User not found"
  - 500: "Internal Server Error"

## 7. 切换用户状态

- **接口**：`PUT /api/users/:id/toggle-status`
- **描述**：启用或禁用指定用户（需要 system:user:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "User enabled/disabled successfully",
    "data": {
      "id": "number",
      "status": "number"
    }
  }
  ```
- **错误**：
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 404: "User not found"
  - 500: "Internal Server Error"

## 8. 批量删除用户

- **接口**：`DELETE /api/users/batch`
- **描述**：批量删除用户（需要 system:user:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "ids": "number[]"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Users deleted successfully",
    "data": {
      "deletedCount": "number"
    }
  }
  ```
- **错误**：
  - 400: "Invalid user IDs provided"
  - 401: "No token provided" / "Invalid or expired token"
  - 403: "Forbidden"
  - 500: "Internal Server Error"

## 9. 获取当前登录用户信息

- **接口**: `/api/users/me`
- **方法**: `GET`
- **描述**: 获取当前登录用户的详细信息，包括用户基本信息、角色、权限和菜单
- **认证**: 需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```

### 响应

#### 成功响应 (200 OK)

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "status": 1
    },
    "roles": [
      {
        "id": 1,
        "name": "管理员",
        "code": "admin"
      }
    ],
    "routes": [
      {
        "id": 1,
        "name": "系统管理",
        "path": "/system",
        "component": "Layout",
        "meta": {
          "title": "系统管理",
          "icon": "系统",
          "noCache": false,
          "link": null
        },
        "children": [
          {
            "id": 2,
            "name": "用户管理",
            "path": "user",
            "component": "system/user/index",
            "meta": {
              "title": "用户管理",
              "icon": "#",
              "noCache": false,
              "link": null
            }
          }
        ]
      }
    ],
    "permissions": [
      "system:user:add",
      "system:user:edit",
      "system:user:delete",
      "system:role:add",
      "system:role:edit"
    ]
  }
}
```

#### 错误响应

##### 未授权 (401 Unauthorized)

```json
{
  "success": false,
  "message": "No token provided",
  "data": null
}
```

##### 用户未找到 (404 Not Found)

```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

### 说明

- `user`: 用户基本信息

  - `id`: 用户 ID
  - `username`: 用户名
  - `email`: 邮箱
  - `status`: 状态（1: 启用, 0: 禁用）

- `roles`: 用户角色列表

  - `id`: 角色 ID
  - `name`: 角色名称
  - `code`: 角色编码

- `routes`: 菜单路由（树形结构）

  - `id`: 路由 ID
  - `name`: 路由名称
  - `path`: 路由路径
  - `component`: 组件路径
  - `meta`: 路由元信息
    - `title`: 菜单标题
    - `icon`: 菜单图标
    - `noCache`: 是否缓存
    - `link`: 外部链接
  - `children`: 子路由

- `permissions`: 权限列表
  - 采用 `{资源编码}:{操作}` 格式，如 `system:user:add`
