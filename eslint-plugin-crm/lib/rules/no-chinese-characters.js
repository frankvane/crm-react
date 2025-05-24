/**
 * @fileoverview 禁止在变量名中使用中文字符
 * @author CRM Team
 */
"use strict";

module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description: "禁止在变量名中使用中文字符",
			category: "命名规范",
			recommended: true,
		},
		fixable: null, // 不自动修复
		schema: [], // 没有额外选项
		messages: {
			noChinese: "变量名 '{{name}}' 包含中文字符，请使用英文命名",
		},
	},

	create: function (context) {
		// 检测字符串是否包含中文
		function hasChinese(str) {
			// 修复正则表达式，仅检测常用中文字符范围
			return /[\u4E00-\u9FFF]/.test(str);
		}

		return {
			// 处理标识符节点
			Identifier: function (node) {
				// 检查变量名是否包含中文
				if (hasChinese(node.name)) {
					context.report({
						node: node,
						messageId: "noChinese",
						data: {
							name: node.name,
						},
					});
				}
			},
		};
	},
};
