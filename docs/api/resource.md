# 资源管理接口文档

## 1. 创建资源

- **接口**：`POST /api/resources`
- **描述**：创建新资源（需要 system:resource:add 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "name": "string",
    "type": "string", // menu/page/button
    "code": "string",
    "path": "string",
    "parentId": "number",
    "component": "string",
    "icon": "string",
    "sort": "number",
    "hidden": "boolean",
    "redirect": "string",
    "alwaysShow": "boolean",
    "meta": {
      "title": "string",
      "icon": "string",
      "noCache": "boolean",
      "link": "string|null"
    },
    "description": "string"
  }
  ```
- **meta 字段说明**：

  - 在请求中，meta 可以直接传递为对象，系统会自动将其序列化为 JSON 字符串
  - 在响应中，meta 会自动被解析为 JSON 对象返回
  - meta 主要用于存储与前端路由相关的配置信息
  - 字段必须是有效的 JSON 结构

- **响应**：
  ```json
  {
    "success": true,
    "message": "Resource created successfully",
    "data": {
      "id": "number",
      "name": "string",
      "type": "string",
      "code": "string",
      "path": "string",
      "parentId": "number",
      "component": "string",
      "icon": "string",
      "sort": "number",
      "hidden": "boolean",
      "redirect": "string",
      "alwaysShow": "boolean",
      "meta": {
        "title": "string",
        "icon": "string",
        "noCache": "boolean",
        "link": "string|null"
      },
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource code already exists",
    "data": null
  }
  ```

## 2. 获取资源列表

- **接口**：`GET /api/resources`
- **描述**：获取所有资源（需要 system:resource:edit 权限）
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
    "data": [
      {
        "id": "number",
        "name": "string",
        "type": "string",
        "code": "string",
        "path": "string",
        "parentId": "number",
        "component": "string",
        "icon": "string",
        "meta": {
          "title": "string",
          "icon": "string",
          "noCache": "boolean",
          "link": "string|null"
        },
        "children": []
      }
    ]
  }
  ```

## 3. 获取单个资源

- **接口**：`GET /api/resources/:id`
- **描述**：获取指定资源详情（需要 system:resource:edit 权限）
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
      "type": "string",
      "code": "string",
      "path": "string",
      "parentId": "number",
      "component": "string",
      "icon": "string",
      "sort": "number",
      "hidden": "boolean",
      "redirect": "string",
      "alwaysShow": "boolean",
      "meta": {
        "title": "string",
        "icon": "string",
        "noCache": "boolean",
        "link": "string|null"
      },
      "description": "string",
      "actions": [
        {
          "id": "number",
          "name": "string",
          "code": "string",
          "description": "string"
        }
      ]
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource not found",
    "data": null
  }
  ```

## 4. 更新资源

- **接口**：`PUT /api/resources/:id`
- **描述**：更新指定资源（需要 system:resource:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：同创建资源
- **响应**：同获取单个资源
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Resource code already exists",
    "data": null
  }
  ```

## 5. 删除资源

- **接口**：`DELETE /api/resources/:id`
- **描述**：删除指定资源（需要 system:resource:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Resource deleted successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Cannot delete resource with child resources",
    "data": null
  }
  ```

# 资源操作管理接口文档

## 1. 创建资源操作

- **接口**：`POST /api/resource-actions`
- **描述**：创建新资源操作（需要 system:resource:action:add 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：
  ```json
  {
    "name": "string",
    "code": "string", // 如：view, add, edit, delete
    "description": "string",
    "resourceId": "number", // 关联的资源ID
    "icon": "string",
    "sort": "number",
    "needConfirm": "boolean",
    "confirmMessage": "string"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Resource action created successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "description": "string",
      "resourceId": "number",
      "icon": "string",
      "sort": "number",
      "needConfirm": "boolean",
      "confirmMessage": "string",
      "permission": {
        "id": "number",
        "name": "string",
        "code": "string",
        "description": "string"
      },
      "resource": {
        "id": "number",
        "name": "string",
        "code": "string",
        "type": "string"
      }
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Resource action already exists",
    "data": null
  }
  ```

## 2. 获取资源操作列表

- **接口**：`GET /api/resource-actions`
- **描述**：获取所有资源操作（需要 system:resource:action:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - `resourceId`: 资源 ID（可选）
- **响应**：
  ```json
  {
    "success": true,
    "message": "Success",
    "data": [
      {
        "id": "number",
        "name": "string",
        "code": "string",
        "description": "string",
        "resourceId": "number",
        "icon": "string",
        "sort": "number",
        "resource": {
          "id": "number",
          "name": "string",
          "code": "string"
        },
        "permission": {
          "id": "number",
          "name": "string",
          "code": "string"
        }
      }
    ]
  }
  ```

## 3. 获取单个资源操作

- **接口**：`GET /api/resource-actions/:id`
- **描述**：获取指定资源操作详情（需要 system:resource:action:edit 权限）
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
      "resourceId": "number",
      "icon": "string",
      "sort": "number",
      "needConfirm": "boolean",
      "confirmMessage": "string",
      "resource": {
        "id": "number",
        "name": "string",
        "code": "string",
        "type": "string"
      },
      "permission": {
        "id": "number",
        "name": "string",
        "code": "string",
        "description": "string"
      }
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource action not found",
    "data": null
  }
  ```

## 4. 更新资源操作

- **接口**：`PUT /api/resource-actions/:id`
- **描述**：更新指定资源操作（需要 system:resource:action:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：同创建资源操作
- **响应**：同获取单个资源操作
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource action not found",
    "data": null
  }
  ```

## 5. 删除资源操作

- **接口**：`DELETE /api/resource-actions/:id`
- **描述**：删除指定资源操作（需要 system:resource:action:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Resource action deleted successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Resource action not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Cannot delete resource action with associated permissions",
    "data": null
  }
  ```
