/**
 * @fileoverview 自定义hooks必须以use开头命名
 * @author CRM Team
 */
"use strict";

module.exports = {
	meta: {
		type: "suggestion",
		docs: {
			description: "自定义hooks必须以use开头命名",
			category: "命名规范",
			recommended: true,
		},
		fixable: "code", // 支持自动修复
		schema: [], // 没有额外选项
		messages: {
			invalidHooksName: "自定义hooks '{{name}}' 应该以 'use' 开头",
		},
	},

	create: function (context) {
		// 检查名称是否以use开头
		function startsWithUse(name) {
			return (
				name.startsWith("use") &&
				name.length > 3 &&
				name[3] === name[3].toUpperCase()
			);
		}

		// 检查函数内部是否使用了React hooks
		function usesReactHooks(node) {
			let usesHooks = false;

			// 遍历函数体中的所有调用表达式
			context.getSourceCode().ast.body.forEach((statement) => {
				if (statement.type === "VariableDeclaration") {
					statement.declarations.forEach((declaration) => {
						if (
							declaration.init &&
							declaration.init.type === "CallExpression" &&
							declaration.init.callee &&
							declaration.init.callee.name &&
							declaration.init.callee.name.startsWith("use")
						) {
							usesHooks = true;
						}
					});
				}
			});

			return usesHooks;
		}

		return {
			// 检查函数声明
			FunctionDeclaration(node) {
				if (node.id && !startsWithUse(node.id.name) && usesReactHooks(node)) {
					context.report({
						node: node.id,
						messageId: "invalidHooksName",
						data: {
							name: node.id.name,
						},
						fix: function (fixer) {
							// 自动添加use前缀
							const firstChar = node.id.name.charAt(0).toUpperCase();
							const restName = node.id.name.slice(1);
							return fixer.replaceText(node.id, `use${firstChar}${restName}`);
						},
					});
				}
			},

			// 检查箭头函数表达式
			VariableDeclarator(node) {
				if (
					node.id &&
					node.id.type === "Identifier" &&
					node.init &&
					(node.init.type === "ArrowFunctionExpression" ||
						node.init.type === "FunctionExpression") &&
					!startsWithUse(node.id.name) &&
					usesReactHooks(node)
				) {
					context.report({
						node: node.id,
						messageId: "invalidHooksName",
						data: {
							name: node.id.name,
						},
						fix: function (fixer) {
							// 自动添加use前缀
							const firstChar = node.id.name.charAt(0).toUpperCase();
							const restName = node.id.name.slice(1);
							return fixer.replaceText(node.id, `use${firstChar}${restName}`);
						},
					});
				}
			},
		};
	},
};
