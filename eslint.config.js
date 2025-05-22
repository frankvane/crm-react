import globals from "globals";
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
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
      "indent": ["error", "tab"],
      // 使用双引号
      "quotes": ["error", "double"],
      // 必须使用分号
      "semi": ["error", "always"],
      // 行尾逗号
      "comma-dangle": ["error", "always-multiline"],
      // 箭头函数总是使用括号
      "arrow-parens": ["error", "always"],
      // console仅警告不报错
      "no-console": "warn",
      // 对象括号间空格
      "object-curly-spacing": ["error", "always"],
    },
  },
  prettierConfig
);
