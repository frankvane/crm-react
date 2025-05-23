import globals from "globals";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import crmPlugin from "./eslint-plugin-crm/index.js";

export default tseslint.config(
	// 忽略文件配置
	{
		ignores: [
			"dist/**/*",
			"node_modules/**/*",
			"**/*.d.ts",
			"**/vite.config.js",
			"**/tsconfig.*.js",
			"**/commitlint.config.js",
			"**/*.config.ts",
			"**/build/**/*",
			"**/__tests__/**/*",
			"**/*.test.{ts,tsx,js,jsx}",
			"**/*.spec.{ts,tsx,js,jsx}",
			"**/mock/**/*",
			"public/**/*",
		],
	},
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
			crm: crmPlugin,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],
			// any 类型
			"@typescript-eslint/no-explicit-any": "off",
			// 缩进使用tab
			indent: ["error", "tab"],
			// 使用双引号
			quotes: ["error", "double"],
			// 必须使用分号
			semi: ["error", "always"],
			// 行尾逗号
			"comma-dangle": ["error", "always-multiline"],
			// 箭头函数总是使用括号
			"arrow-parens": ["error", "always"],
			// 对象括号间空格
			"object-curly-spacing": ["error", "always"],
			// 最多允许1个空行
			"no-multiple-empty-lines": ["error", { max: 1 }],
			// 添加自定义规则
			"crm/no-chinese-characters": "error",
			"crm/max-component-file-size": ["warn", { maxLines: 500 }],
			"crm/hooks-naming-convention": "error",
			"crm/require-file-header": "warn", // 添加文件头部注释规则
		},
	},
	// 排除特定文件/目录不检查文件头注释
	{
		files: [
			"**/types/**/*.{ts,tsx}",
			"**/constants/**/*.{ts,tsx}",
			"**/*.d.ts", // TypeScript声明文件
		],
		rules: {
			"crm/require-file-header": "off", // 关闭这些文件的文件头检查
		},
	},
	prettierConfig,
);
