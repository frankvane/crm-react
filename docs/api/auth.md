# 认证接口文档

## 1. 用户登录

- **接口**：`POST /api/auth/login`
- **描述**：用户登录，返回访问令牌和刷新令牌
- **请求体**：
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "User not found" | "Invalid password",
    "data": null
  }
  ```

## 2. 刷新令牌

- **接口**：`POST /api/auth/refresh`
- **描述**：使用刷新令牌获取新的访问令牌
- **请求体**：
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": { "accessToken": "string" }
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "No refresh token provided" | "Invalid refresh token" | "Refresh token expired",
    "data": null
  }
  ```

## 3. 注销登录

- **接口**：`POST /api/auth/logout`
- **描述**：注销用户并使刷新令牌失效
- **请求体**：
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **响应**：
  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "data": null
  }
  ```
- **错误响应**：
  ```json
  {
    "success": false,
    "message": "No refresh token provided",
    "data": null
  }
  ```
