/**
 * @file 获取分类数据
 * @author 王家壮
 * @date 2025-05-23
 * @last_modified_by 最后修改人
 * @last_modified_time YYYY-MM-DD
 */

import { useMemo } from "react";
import {
	useCategoryTypeQueries,
	CATEGORY_TYPES,
} from "@/api/query/useCategoryTypeQuery";
import { transformToOptions } from "../utils";

/**
 * 加载并处理分类数据的Hook
 * @returns 分类数据和选项
 */
export function useCategoryData() {
	const categoryQueries = useCategoryTypeQueries();

	// 检查是否有错误
	const error = categoryQueries.some((query) => query.error);

	// 检查是否正在加载
	const isLoading = categoryQueries.some((query) => query.isLoading);

	// 使用 useMemo 缓存转换后的选项数据
	const options = useMemo(() => {
		const [productCategories, brands, dosageForms, units] = categoryQueries.map(
			(query) => query.data || [],
		);

		return {
			categoryOptions: transformToOptions(productCategories),
			brandOptions: transformToOptions(brands),
			dosageFormOptions: transformToOptions(dosageForms),
			unitOptions: transformToOptions(units),
		};
	}, [categoryQueries]);

	return {
		categoryData: {
			isLoading,
			error,
		},
		options,
	};
}

// 导出分类类型常量供其他模块使用
export { CATEGORY_TYPES };
