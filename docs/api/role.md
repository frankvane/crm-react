# 角色管理接口文档

## 1. 创建角色

- **接口**：`POST /api/roles`
- **描述**：创建新角色（需要 system:role:add 权限）
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
    "permissionIds": "number[]"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Role created successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "description": "string",
      "permissions": [
        {
          "id": "number",
          "name": "string",
          "code": "string"
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Role name already exists",
    "data": null
  }
  ```

## 2. 获取角色列表

- **接口**：`GET /api/roles`
- **描述**：获取角色列表（需要 system:role:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - `page`: 页码（默认：1）
  - `pageSize`: 每页数量（默认：10）
  - `search`: 搜索关键词
- **响应**：
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "list": [
        {
          "id": "number",
          "name": "string",
          "code": "string",
          "description": "string",
          "permissions": [
            {
              "id": "number",
              "name": "string",
              "code": "string"
            }
          ]
        }
      ],
      "pagination": {
        "current": "number",
        "pageSize": "number",
        "total": "number"
      }
    }
  }
  ```

## 3. 获取单个角色

- **接口**：`GET /api/roles/:id`
- **描述**：获取指定角色信息（需要 system:role:edit 权限）
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
      "name": "string",
      "code": "string",
      "description": "string",
      "permissions": [
        {
          "id": "number",
          "name": "string",
          "code": "string"
        }
      ],
      "resources": [
        {
          "id": "number",
          "name": "string",
          "code": "string",
          "type": "string"
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Role not found",
    "data": null
  }
  ```

## 4. 更新角色

- **接口**：`PUT /api/roles/:id`
- **描述**：更新指定角色信息（需要 system:role:edit 权限）
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
    "permissionIds": "number[]"
  }
  ```
- **响应**：与获取单个角色接口相同
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Role name already exists",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Role not found",
    "data": null
  }
  ```

## 5. 删除角色

- **接口**：`DELETE /api/roles/:id`
- **描述**：删除指定角色（需要 system:role:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Role deleted successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Cannot delete role with associated users",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Role not found",
    "data": null
  }
  ```

## 6. 为角色分配权限

- **接口**：`PUT /api/roles/:id/permissions`
- **描述**：为指定角色分配权限（需要 system:role:assign 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "permissionIds": "number[]"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Permissions assigned successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "permissions": [
        {
          "id": "number",
          "name": "string",
          "code": "string"
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Role not found",
    "data": null
  }
  ```

## 7. 为角色分配资源

- **接口**：`PUT /api/roles/:id/resources`
- **描述**：为指定角色分配资源（需要 system:role:assign 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "resources": [
      {
        "resourceId": "number",
        "permissionIds": "number[]"
      }
    ]
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Resources assigned successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "resources": [
        {
          "id": "number",
          "name": "string",
          "code": "string",
          "type": "string",
          "permissions": [
            {
              "id": "number",
              "name": "string",
              "code": "string"
            }
          ]
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Role not found",
    "data": null
  }
  ```
