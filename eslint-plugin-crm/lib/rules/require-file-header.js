/**
 * @fileoverview 强制要求文件包含标准头部注释（开发人员和更新时间）
 * @author CRM Team
 */
"use strict";

module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description: "强制要求文件包含标准头部注释",
			category: "注释规范",
			recommended: true,
		},
		fixable: "code", // 支持自动修复
		schema: [], // 没有额外选项
		messages: {
			missingHeader: "文件缺少标准头部注释（开发人员和更新时间）",
			incompleteHeader: "文件头部注释不完整，必须包含开发人员和更新时间信息",
		},
	},

	create: function (context) {
		const sourceCode = context.getSourceCode();
		const comments = sourceCode.getAllComments();

		return {
			Program: function (node) {
				// 查找文件头部的块级注释
				const headerComment = comments.find((comment) => {
					// 只考虑文件顶部的块注释
					return comment.type === "Block" && comment.loc.start.line <= 3;
				});

				const currentDate = new Date().toISOString().split("T")[0]; // 格式: YYYY-MM-DD

				// 如果没有找到头部注释
				if (!headerComment) {
					context.report({
						node: node,
						messageId: "missingHeader",
						fix: function (fixer) {
							// 创建标准头部注释
							const headerText = `/**
 * @file 文件描述
 * @author 开发人员
 * @date ${currentDate}
 * @last_modified_by 最后修改人
 * @last_modified_time ${currentDate}
 */\n\n`;

							return fixer.insertTextBefore(node, headerText);
						},
					});
					return;
				}

				// 检查注释内容是否包含必要的信息
				const commentText = headerComment.value;
				const hasAuthor = /@author/.test(commentText);
				const hasDate = /@date|@last_modified_time/.test(commentText);

				if (!hasAuthor || !hasDate) {
					context.report({
						node: headerComment,
						messageId: "incompleteHeader",
						fix: function (fixer) {
							// 创建或修改标准头部注释
							let newCommentText = "/**\n";

							if (!commentText.includes("@file")) {
								newCommentText += " * @file 文件描述\n";
							}

							if (!hasAuthor) {
								newCommentText += " * @author 开发人员\n";
							}

							if (!commentText.includes("@date")) {
								newCommentText += ` * @date ${currentDate}\n`;
							}

							if (!commentText.includes("@last_modified_by")) {
								newCommentText += " * @last_modified_by 最后修改人\n";
							}

							if (!commentText.includes("@last_modified_time")) {
								newCommentText += ` * @last_modified_time ${currentDate}\n`;
							}

							newCommentText += " */\n\n";

							return fixer.replaceText(headerComment, newCommentText);
						},
					});
				}
			},
		};
	},
};
