# RBAC DEMO 数据示例

本示例基于 seeders/init.js，便于前端开发模拟 RBAC 权限体系。

## 1. 角色（Role）

| 角色名     | code    | 说明       |
| ---------- | ------- | ---------- |
| 管理员     | admin   | 系统管理员 |
| 高级管理员 | manager | 高级管理员 |
| 普通管理员 | user    | 普通管理员 |

## 2. 权限（Permission）

| name              | action | resource     | 描述         |
| ----------------- | ------ | ------------ | ------------ |
| create_user       | create | user         | 创建用户     |
| view_users        | read   | user         | 查看用户     |
| update_user       | update | user         | 更新用户     |
| delete_user       | delete | user         | 删除用户     |
| manage_roles      | manage | role         | 管理角色     |
| view_roles        | read   | role         | 查看角色     |
| manage_resources  | manage | resource     | 管理资源     |
| view_resources    | read   | resource     | 查看资源     |
| manage_categories | manage | categoryType | 管理分类类型 |
| view_categories   | read   | categoryType | 查看分类类型 |
| manage_category   | manage | category     | 管理分类     |
| view_category     | read   | category     | 查看分类     |

## 3. 资源菜单（Resource）

- 系统管理（/system, Layout）
  - 用户管理（system:user, /system/user）
  - 角色管理（system:role, /system/role）
  - 资源管理（system:resource, /system/resource）
- 分类管理（/category, Layout）
  - 分类类型管理（category:type, /category/type）
  - 分类管理（category:category, /category/category）

## 4. 按钮级操作（ResourceAction）

| name | code   | 说明     |
| ---- | ------ | -------- |
| 新增 | add    | 新增操作 |
| 编辑 | edit   | 编辑操作 |
| 删除 | delete | 删除操作 |

## 5. 角色-权限分配

- 管理员（admin）：拥有所有权限
- 高级管理员（manager）：仅有分类类型和分类管理的增删改查
- 普通管理员（user）：仅有分类管理-查

## 6. 角色-菜单可见性

- 管理员：所有菜单
- 高级管理员：仅分类管理、分类类型管理、分类管理菜单
- 普通管理员：仅分类管理、分类管理菜单

## 7. 用户（User）

| 用户名  | 密码       | 角色       |
| ------- | ---------- | ---------- |
| admin   | admin123   | 管理员     |
| manager | manager123 | 高级管理员 |
| user    | user123    | 普通管理员 |

---

前端可根据上述结构，模拟菜单、按钮、权限点的动态渲染与控制。
