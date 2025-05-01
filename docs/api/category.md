# 分类类型接口文档

## 1. 创建分类类型

- **接口**：`POST /api/category-types`
- **描述**：创建新的分类类型（需要 system:category:type:add 权限）
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
    "status": "boolean"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Category type created successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "description": "string",
      "status": "boolean",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category type code already exists",
    "data": null
  }
  ```

## 2. 获取分类类型列表

- **接口**：`GET /api/category-types`
- **描述**：获取所有分类类型（需要 system:category:type:view 权限）
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
        "code": "string",
        "description": "string",
        "status": "boolean",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ]
  }
  ```

## 3. 获取单个分类类型

- **接口**：`GET /api/category-types/:id`
- **描述**：获取指定分类类型详情（需要 system:category:type:view 权限）
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
      "status": "boolean",
      "createdAt": "string",
      "updatedAt": "string",
      "categories": [ ... ] // 关联的分类列表
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category type not found",
    "data": null
  }
  ```

## 4. 更新分类类型

- **接口**：`PUT /api/category-types/:id`
- **描述**：更新指定分类类型（需要 system:category:type:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：同创建分类类型
- **响应**：同获取单个分类类型
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category type not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Category type code already exists",
    "data": null
  }
  ```

## 5. 删除分类类型

- **接口**：`DELETE /api/category-types/:id`
- **描述**：删除指定分类类型（需要 system:category:type:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Category type deleted successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category type not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Cannot delete category type with associated categories",
    "data": null
  }
  ```

# 分类接口文档

## 1. 创建分类

- **接口**：`POST /api/categories`
- **描述**：创建新的分类（需要 system:category:add 权限）
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
    "typeId": "number",
    "parentId": "number",
    "sort": "number",
    "description": "string"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Category created successfully",
    "data": {
      "id": "number",
      "name": "string",
      "code": "string",
      "typeId": "number",
      "parentId": "number",
      "sort": "number",
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "type": {
        "id": "number",
        "name": "string",
        "code": "string"
      },
      "parent": {
        "id": "number",
        "name": "string",
        "code": "string"
      }
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category code already exists",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Category type not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Parent category not found",
    "data": null
  }
  ```

## 2. 获取分类列表

- **接口**：`GET /api/categories`
- **描述**：获取所有分类（需指定 typeId 查询参数）（需要 system:category:view 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - `typeId`：分类类型 ID（必填）
- **示例**：
  ```
  GET /api/categories?typeId=1
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
        "code": "string",
        "typeId": "number",
        "parentId": "number",
        "sort": "number",
        "description": "string",
        "type": {
          "id": "number",
          "name": "string",
          "code": "string"
        },
        "parent": {
          "id": "number",
          "name": "string",
          "code": "string"
        }
      }
    ]
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "TypeId is required",
    "data": null
  }
  ```

## 3. 获取单个分类

- **接口**：`GET /api/categories/:id`
- **描述**：获取指定分类详情（需要 system:category:view 权限）
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
      "typeId": "number",
      "parentId": "number",
      "sort": "number",
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "type": {
        "id": "number",
        "name": "string",
        "code": "string"
      },
      "parent": {
        "id": "number",
        "name": "string",
        "code": "string"
      },
      "children": [ ... ] // 子分类
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category not found",
    "data": null
  }
  ```

## 4. 获取分类树

- **接口**：`GET /api/categories/tree`
- **描述**：获取分类树结构（需指定 typeId 查询参数）（需要 system:category:view 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **查询参数**：
  - `typeId`：分类类型 ID（必填）
- **示例**：
  ```
  GET /api/categories/tree?typeId=1
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
        "code": "string",
        "typeId": "number",
        "parentId": "number",
        "sort": "number",
        "description": "string",
        "children": [ ... ] // 嵌套的子分类
      }
    ]
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "TypeId is required",
    "data": null
  }
  ```

## 5. 更新分类

- **接口**：`PUT /api/categories/:id`
- **描述**：更新指定分类（需要 system:category:edit 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **请求体**：同创建分类
- **响应**：同获取单个分类
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Category code already exists",
    "data": null
  }
  ```

## 6. 删除分类

- **接口**：`DELETE /api/categories/:id`
- **描述**：删除指定分类（需要 system:category:delete 权限）
- **认证**：需要有效的访问令牌（Bearer Token）
- **请求头**：
  ```
  Authorization: Bearer <accessToken>
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Category deleted successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "Category not found",
    "data": null
  }
  ```
  或
  ```json
  {
    "success": false,
    "message": "Cannot delete category with child categories",
    "data": null
  }
  ```
