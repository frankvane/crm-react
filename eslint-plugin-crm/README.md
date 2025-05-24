# ESLint Plugin CRM

CRM项目专用的ESLint自定义规则插件

## 安装

由于是本地插件，无需安装，已经集成到项目中。

## 可用规则

### `crm/no-chinese-characters`

禁止在变量名、函数名等标识符中使用中文字符。

**错误示例**:

```js
const 用户名 = "John";
function 获取数据() { }
```

**正确示例**:

```js
const username = "John";
function getData() { }
```

### `crm/max-component-file-size`

限制组件文件大小，默认超过500行提示警告，建议拆分组件。

**配置选项**:

```js
{
  "crm/max-component-file-size": ["warn", { maxLines: 500 }]
}
```
// ... existing code ...

## 规则列表

### no-chinese-characters

禁止在代码中使用中文字符（字符串除外）。

### max-component-file-size

限制组件文件的最大行数，默认为500行。

### hooks-naming-convention

强制要求自定义hooks必须以use开头命名。

### require-file-header

强制要求文件包含标准头部注释，包括开发人员和更新时间信息。

标准头部格式:
```js
/**
 * @file 文件描述
 * @author 开发人员
 * @date YYYY-MM-DD
 * @last_modified_by 最后修改人
 * @last_modified_time YYYY-MM-DD
 */
```

#### 批量添加文件头部注释

项目提供了批量添加头部注释的脚本，可以通过以下命令运行：

```bash
npm run add-headers
```

该脚本会自动为项目中符合条件的文件添加标准头部注释，并跳过已经有头部注释的文件。

脚本特性：
- 自动识别项目中的源文件（.js, .jsx, .ts, .tsx, .less, .css, .scss, .vue）
- 智能跳过已有头部注释的文件
- 忽略特定文件类型（如配置文件、类型声明文件、测试文件等）
- 添加统一的文件头格式，确保代码规范一致性

如需修改脚本的行为，可编辑 `scripts/add-file-headers.js` 文件。

## 使用方法

### 安装

```bash
npm install --save-dev eslint-plugin-crm
```

### 配置

在你的ESLint配置文件中添加：

```js
{
  "plugins": ["crm"],
  "rules": {
    "crm/no-chinese-characters": "error",
    "crm/max-component-file-size": ["warn", { maxLines: 500 }],
    "crm/hooks-naming-convention": "error",
    "crm/require-file-header": "warn"
  }
}
```

## 忽略文件

对于特定类型的文件，你可能希望忽略某些规则。例如：

```js
{
  "files": [
    "**/types/**/*.{ts,tsx}",
    "**/constants/**/*.{ts,tsx}",
    "**/*.d.ts"
  ],
  "rules": {
    "crm/require-file-header": "off"
  }
}
```

## 贡献

欢迎提交问题和拉取请求！
## 如何添加新规则

1. 在 `lib/rules` 目录下添加新规则的实现文件，例如 `my-new-rule.js`
2. 在 `index.js` 中注册该规则：

```js
rules: {
  "no-chinese-characters": require("./lib/rules/no-chinese-characters"),
  "max-component-file-size": require("./lib/rules/max-component-file-size"),
  "my-new-rule": require("./lib/rules/my-new-rule")
},
```

3. 更新 `eslint.config.js` 启用该规则：

```js
rules: {
  // 其他规则...
  "crm/my-new-rule": "error", // 或 "warn"
},
```

## 使用方法

规则已经在项目级 ESLint 配置中启用，直接运行下列命令即可检查代码：

```bash
npm run lint
``` 