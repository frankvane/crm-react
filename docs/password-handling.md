# 密码处理机制

## 重要提示 ⚠️

系统使用自动密码加密机制，通过 User 模型的钩子（hooks）实现。这意味着在创建或更新用户时，**不需要也不应该**手动加密密码。

## 正确的密码处理方式

### 1. 创建用户

```javascript
// ✅ 正确方式：直接传入原始密码
await User.create({
  username: "newuser",
  password: "original_password", // 密码会被钩子自动加密
  email: "user@example.com",
});

// ❌ 错误方式：手动加密密码
await User.create({
  username: "newuser",
  password: await bcrypt.hash("original_password", 10), // 不要这样做！会导致双重加密
  email: "user@example.com",
});
```

### 2. 更新用户密码

```javascript
// ✅ 正确方式：直接设置新密码
user.password = "new_password";
await user.save();

// ❌ 错误方式：手动加密新密码
user.password = await bcrypt.hash("new_password", 10); // 不要这样做！
await user.save();
```

### 3. 批量创建用户（如在 seeders 中）

```javascript
// ✅ 正确方式：使用原始密码
await User.bulkCreate([
  {
    username: "user1",
    password: "password1", // 会被自动加密
  },
  {
    username: "user2",
    password: "password2", // 会被自动加密
  },
]);

// ❌ 错误方式：手动加密密码
await User.bulkCreate([
  {
    username: "user1",
    password: await bcrypt.hash("password1", 10), // 不要这样做！
  },
]);
```

## 密码验证

密码验证应该使用 bcrypt.compare 方法：

```javascript
const isValid = await bcrypt.compare(inputPassword, user.password);
```

## 技术实现

密码的自动加密是通过 User 模型中的两个钩子实现的：

1. `beforeCreate`: 在创建新用户时自动加密密码
2. `beforeUpdate`: 在更新用户密码时自动加密新密码

```javascript
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});
```

## 常见问题

1. **问题**: 登录验证失败，提示密码错误
   **原因**: 最可能的原因是密码被加密了两次
   **解决**: 确保在创建或更新用户时使用原始密码，不要手动加密

2. **问题**: 批量创建用户时密码验证失败
   **原因**: 在 seeder 或批量创建中手动加密了密码
   **解决**: 使用原始密码，让模型的钩子处理加密

## 最佳实践检查清单

- [ ] 创建用户时使用原始密码
- [ ] 更新用户密码时使用原始新密码
- [ ] 在 seeders 中使用原始密码
- [ ] 使用 bcrypt.compare 进行密码验证
- [ ] 不在模型外部进行密码加密
