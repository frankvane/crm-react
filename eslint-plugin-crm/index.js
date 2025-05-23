/**
 * @fileoverview CRM项目自定义ESLint规则
 * @author CRM Team
 */
"use strict";

module.exports = {
	// 定义所有规则
	rules: {
		"no-chinese-characters": require("./lib/rules/no-chinese-characters"),
		"max-component-file-size": require("./lib/rules/max-component-file-size"),
		"hooks-naming-convention": require("./lib/rules/hooks-naming-convention"),
		"require-file-header": require("./lib/rules/require-file-header"),
	},

	// 预定义配置
	configs: {
		recommended: {
			plugins: ["crm"],
			rules: {
				"crm/no-chinese-characters": "error",
				"crm/max-component-file-size": ["warn", { maxLines: 500 }],
				"crm/hooks-naming-convention": "error",
				"crm/require-file-header": "warn",
			},
		},
	},
};
