# 模型关联别名命名规范

## 核心原则

1. **一致性**: 所有模型中的关联别名必须统一，不允许混用大小写或复数形式
2. **清晰性**: 别名应清晰表达模型之间的关系
3. **可维护性**: 遵循共同约定，便于团队协作和代码维护

## 关联类型与命名规则

### 1. 多对多关联 (Many-to-Many)

- **命名规则**: 使用小写复数形式
- **格式**: `模型名称的复数小写形式`
- **示例**:
  - `User -> Role`: `"roles"`
  - `Role -> Permission`: `"permissions"`
  - `Role -> Resource`: `"resources"`
  - `Resource -> Role`: `"roles"`
  - `Permission -> Role`: `"roles"`

### 2. 一对多关联 (One-to-Many)

- **命名规则**: 使用小写复数形式表示"多"的一方
- **格式**: `模型名称的复数小写形式`
- **示例**:
  - `Resource -> ResourceAction`: `"actions"`
  - `Resource -> Permission`: `"permissions"`
  - `Resource -> Resource` (自引用): `"children"`
  - `User -> RefreshToken`: `"refreshTokens"`
  - `CategoryType -> Category`: `"categories"`

### 3. 多对一关联 (Many-to-One) 或一对一关联 (One-to-One)

- **命名规则**: 使用小写单数形式
- **格式**: `模型名称的单数小写形式`
- **示例**:
  - `Permission -> Resource`: `"resource"`
  - `Permission -> ResourceAction`: `"action"`
  - `ResourceAction -> Resource`: `"resource"`
  - `ResourceAction -> Permission`: `"permission"`
  - `Resource -> Resource` (自引用): `"parent"`
  - `Category -> Category` (自引用): `"parent"`
  - `Category -> CategoryType`: `"type"`

## 禁止的用法

1. **混用大小写**: 不应使用 `Roles`, `Permissions` 等首字母大写形式
2. **不一致的复数/单数**: 同类关联必须保持一致的复数或单数形式
3. **无意义的缩写**: 避免使用难以理解的缩写

## 代码示例

### 正确示例

```javascript
// User 模型定义关联
User.belongsToMany(models.Role, {
  through: "UserRoles",
  foreignKey: "userId",
  otherKey: "roleId",
  as: "roles", // 正确: 小写复数
});

// Role 模型定义关联
Role.belongsToMany(models.Permission, {
  through: "RolePermissions",
  foreignKey: "roleId",
  otherKey: "permissionId",
  as: "permissions", // 正确: 小写复数
});

// 一对多关系
Resource.hasMany(models.ResourceAction, {
  foreignKey: "resourceId",
  as: "actions", // 正确: 小写复数
});

// 多对一关系
ResourceAction.belongsTo(models.Resource, {
  foreignKey: "resourceId",
  as: "resource", // 正确: 小写单数
});
```

### 错误示例

```javascript
// 避免这种方式
User.belongsToMany(models.Role, {
  through: "UserRoles",
  foreignKey: "userId",
  otherKey: "roleId",
  as: "Roles", // 错误: 首字母大写
});

// 避免这种方式
Role.belongsToMany(models.Permission, {
  through: "RolePermissions",
  foreignKey: "roleId",
  otherKey: "permissionId",
  as: "permission", // 错误: 使用单数形式表示多对多关系
});
```

## 查询时的一致性

在查询模型时，确保使用与模型定义一致的别名:

```javascript
// 正确的查询方式
const user = await User.findByPk(userId, {
  include: [
    {
      model: Role,
      as: "roles", // 与模型定义一致
      include: [
        {
          model: Permission,
          as: "permissions", // 与模型定义一致
        },
      ],
    },
  ],
});

// 正确的属性访问方式
const hasPermission = user.roles.some((role) =>
  role.permissions.some((permission) => permission.name === requiredPermission)
);
```

## 应用于控制器层的规范

在控制器中查询或操作模型关联时，必须使用与模型定义一致的别名:

```javascript
// 控制器中的查询示例
async getUser(req, res) {
  const user = await User.findByPk(req.params.id, {
    include: [
      {
        model: Role,
        as: "roles", // 与模型定义一致
      }
    ]
  });

  // 数据处理...
}
```

## 应用于服务层的规范

服务层中的关联查询也必须遵循相同的别名规范:

```javascript
// 服务层中的方法示例
async checkUserPermission(userId, permissionName) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Role,
        as: "roles", // 与模型定义一致
        include: [
          {
            model: Permission,
            as: "permissions", // 与模型定义一致
          }
        ]
      }
    ]
  });

  return user.roles.some(role =>
    role.permissions.some(permission => permission.name === permissionName)
  );
}
```

## 模型架构总览

下面是当前项目中所有模型的关联别名规范:

| 模型           | 关联到              | 关联类型 | 标准别名        |
| -------------- | ------------------- | -------- | --------------- |
| User           | Role                | 多对多   | "roles"         |
| User           | RefreshToken        | 一对多   | "refreshTokens" |
| Role           | User                | 多对多   | "users"         |
| Role           | Permission          | 多对多   | "permissions"   |
| Role           | Resource            | 多对多   | "resources"     |
| Permission     | Role                | 多对多   | "roles"         |
| Permission     | Resource            | 多对一   | "resource"      |
| Permission     | ResourceAction      | 多对一   | "action"        |
| Resource       | Resource (parent)   | 多对一   | "parent"        |
| Resource       | Resource (children) | 一对多   | "children"      |
| Resource       | Role                | 多对多   | "roles"         |
| Resource       | Permission          | 一对多   | "permissions"   |
| Resource       | ResourceAction      | 一对多   | "actions"       |
| ResourceAction | Resource            | 多对一   | "resource"      |
| ResourceAction | Permission          | 一对一   | "permission"    |
| CategoryType   | Category            | 一对多   | "categories"    |
| Category       | Category (parent)   | 多对一   | "parent"        |
| Category       | Category (children) | 一对多   | "children"      |
| Category       | CategoryType        | 多对一   | "type"          |

## 实施建议

1. 使用 ESLint 规则来确保关联别名的一致性
2. 代码审查时特别关注关联别名的命名
3. 重构已有代码时统一采用此规范
4. 在项目文档中引用此规范，确保所有开发人员都了解并遵循
