export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always", 
      [
        "feat", // 新功能
        "fix", // 修复
        "docs", // 文档
        "style", // 样式
        "refactor", // 重构
        "perf", // 性能优化
        "test", // 测试
        "build", // 构建
        "ci", // CI配置
        "chore", // 杂务
        "revert" // 回退
      ]
    ],
    "type-case": [2, "always", "lower"],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-case": [0],
    "header-max-length": [2, "always", 72]
  }
}; 