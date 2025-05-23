/**
 * @fileoverview 限制React组件文件大小，超过500行需要拆分
 * @author CRM Team
 */
"use strict";

module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description: "限制React组件文件大小，超过500行需要拆分",
			category: "文件结构",
			recommended: true,
		},
		fixable: null,
		schema: [
			{
				type: "object",
				properties: {
					maxLines: {
						type: "number",
						minimum: 1,
					},
				},
				additionalProperties: false,
			},
		],
		messages: {
			tooLarge: "组件文件超过 {{maxLines}} 行，请考虑拆分组件",
		},
	},

	create: function (context) {
		const options = context.options[0] || {};
		const maxLines = options.maxLines || 500; // 默认500行

		return {
			Program: function (node) {
				const sourceCode = context.getSourceCode();
				const lines = sourceCode.lines || sourceCode.text.split("\n");

				// 计算有效代码行数（排除空行和纯注释行）
				let effectiveLines = 0;
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i].trim();
					if (line && !line.startsWith("//")) {
						effectiveLines++;
					}
				}

				if (effectiveLines > maxLines) {
					context.report({
						node: node,
						messageId: "tooLarge",
						data: {
							maxLines: maxLines,
						},
					});
				}
			},
		};
	},
};
