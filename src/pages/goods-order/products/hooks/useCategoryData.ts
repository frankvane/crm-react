import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getCategoryTree } from "@/api/modules/category";
import { flattenTreeToOptions } from "../utils";
import { CategoryData } from "../types";

// 分类类型常量
const CATEGORY_TYPES = {
	PRODUCT: 23,
	BRAND: 21,
	DOSAGE_FORM: 18,
	UNIT: 22,
} as const;

/**
 * 加载并处理分类数据的Hook
 * @returns 分类数据和选项
 */
export function useCategoryData() {
	// 使用useQueries批量查询
	const categoryQueries = useQueries({
		queries: [
			{
				queryKey: ["categoryTree", CATEGORY_TYPES.PRODUCT],
				queryFn: () => getCategoryTree(CATEGORY_TYPES.PRODUCT),
				staleTime: 5 * 60 * 1000, // 5分钟缓存
			},
			{
				queryKey: ["categoryTree", CATEGORY_TYPES.BRAND],
				queryFn: () => getCategoryTree(CATEGORY_TYPES.BRAND),
				staleTime: 5 * 60 * 1000,
			},
			{
				queryKey: ["categoryTree", CATEGORY_TYPES.DOSAGE_FORM],
				queryFn: () => getCategoryTree(CATEGORY_TYPES.DOSAGE_FORM),
				staleTime: 5 * 60 * 1000,
			},
			{
				queryKey: ["categoryTree", CATEGORY_TYPES.UNIT],
				queryFn: () => getCategoryTree(CATEGORY_TYPES.UNIT),
				staleTime: 5 * 60 * 1000,
			},
		],
	});

	// 检查是否有任何查询正在加载
	const isLoading = categoryQueries.some((query) => query.isLoading);

	// 检查是否有任何查询发生错误
	const error = categoryQueries.find((query) => query.error)?.error;

	// 提取数据
	const [productCategories, brands, dosageForms, units] = categoryQueries.map(
		(query) => query.data || [],
	);

	// 使用useMemo缓存计算结果，避免不必要的重新计算
	const categoryOptions = useMemo(
		() => flattenTreeToOptions(productCategories),
		[productCategories],
	);

	const brandOptions = useMemo(() => flattenTreeToOptions(brands), [brands]);

	const dosageFormOptions = useMemo(
		() => flattenTreeToOptions(dosageForms),
		[dosageForms],
	);

	const unitOptions = useMemo(() => flattenTreeToOptions(units), [units]);

	// 返回数据和状态
	return {
		categoryData: {
			productCategories,
			brands,
			dosageForms,
			units,
			isLoading,
		} as CategoryData,
		options: {
			categoryOptions,
			brandOptions,
			dosageFormOptions,
			unitOptions,
		},
		error,
	};
}

// 导出分类类型常量供其他模块使用
export { CATEGORY_TYPES };
