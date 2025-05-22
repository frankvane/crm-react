import { ICategoryTreeNode } from "@/types/api/category";
import { Option } from "./types";

// 缓存树扁平化结果
const optionsCache = new Map<string, Option[]>();

/**
 * 将树形数据转换为扁平的选项数组（带缓存）
 * @param nodes 树形节点数组
 * @param cacheKey 缓存键（可选）
 * @returns 扁平化的选项数组
 */
export const flattenTreeToOptions = (
	nodes: ICategoryTreeNode[],
	cacheKey?: string,
): Option[] => {
	try {
		// 如果传入了缓存键且有缓存，直接返回
		if (cacheKey && optionsCache.has(cacheKey)) {
			return optionsCache.get(cacheKey)!;
		}

		// 没有传入数据时返回空数组
		if (!nodes || !Array.isArray(nodes)) {
			return [];
		}

		let options: Option[] = [];

		// 递归处理树形数据
		nodes.forEach((node) => {
			if (!node.children || node.children.length === 0) {
				// 叶子节点直接添加
				options.push({ label: node.name, value: node.id });
			} else if (node.children && node.children.length > 0) {
				// 如果有子节点，继续递归处理
				options = options.concat(flattenTreeToOptions(node.children));
			}
		});

		// 如果传入了缓存键，存入缓存
		if (cacheKey) {
			optionsCache.set(cacheKey, options);
		}

		return options;
	} catch (error) {
		console.error("Error flattening tree options:", error);
		return [];
	}
};

/**
 * 清除指定键或所有的选项缓存
 * @param cacheKey 缓存键（可选，不传则清除所有缓存）
 */
export const clearOptionsCache = (cacheKey?: string): void => {
	if (cacheKey) {
		optionsCache.delete(cacheKey);
	} else {
		optionsCache.clear();
	}
};

/**
 * 格式化分类数据
 * @param categories 分类数据
 * @param cacheKey 缓存键（可选）
 * @returns 格式化后的选项数组
 */
export const formatCategoryOptions = (
	categories: ICategoryTreeNode[],
	cacheKey?: string,
): Option[] => {
	return flattenTreeToOptions(categories, cacheKey);
};

/**
 * 判断是否为空数据
 * @param value 要检查的值
 * @returns 是否为空
 */
export const isEmpty = (value: any): boolean => {
	return (
		value === undefined ||
		value === null ||
		(typeof value === "string" && value.trim() === "") ||
		(Array.isArray(value) && value.length === 0) ||
		(typeof value === "object" && Object.keys(value).length === 0)
	);
};
