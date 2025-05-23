/**
 * @file 文件描述
 * @author 开发人员
 * @date YYYY-MM-DD
 * @last_modified_by 最后修改人
 * @last_modified_time YYYY-MM-DD
 */
import {
	useQuery,
	useMutation,
	useQueryClient,
	UseMutationOptions,
	useQueries,
} from "@tanstack/react-query";
import {
	getCategoryTypes,
	getAllCategoryTypes,
	getCategoryType,
	createCategoryType,
	updateCategoryType,
	deleteCategoryType,
} from "@/api/modules/category-type";
import type {
	ICategoryType,
	ICategoryTypeQueryParams,
} from "@/types/api/category-type";
import { getCategoryTree } from "@/api/modules/category";

// 获取分类类型列表
export function useCategoryTypesQuery(params: ICategoryTypeQueryParams) {
	return useQuery({
		queryKey: ["categoryTypes", params],
		queryFn: () => getCategoryTypes(params),
	});
}

// 获取所有分类类型（不分页）
export function useAllCategoryTypesQuery() {
	return useQuery({
		queryKey: ["allCategoryTypes"],
		queryFn: getAllCategoryTypes,
	});
}

// 获取单个分类类型
export function useCategoryTypeQuery(id: number) {
	return useQuery({
		queryKey: ["categoryType", id],
		queryFn: () => getCategoryType(id),
		enabled: !!id,
	});
}

// 创建分类类型
export function useCreateCategoryTypeMutation(
	options?: UseMutationOptions<ICategoryType, Error, Partial<ICategoryType>>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createCategoryType,
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["categoryTypes"] });
			queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}

// 更新分类类型
export function useUpdateCategoryTypeMutation(
	options?: UseMutationOptions<
		ICategoryType,
		Error,
		{ id: number; data: Partial<ICategoryType> }
	>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }) => updateCategoryType(id, data),
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["categoryTypes"] });
			queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}

// 删除分类类型
export function useDeleteCategoryTypeMutation(
	options?: UseMutationOptions<null, Error, number>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteCategoryType,
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["categoryTypes"] });
			queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}

// 分类类型常量
export const CATEGORY_TYPES = {
	PRODUCT: 6,
	BRAND: 7,
	DOSAGE_FORM: 3,
	UNIT: 8,
} as const;

/**
 * 获取分类类型数据的查询 Hook
 * @returns 分类查询结果
 */
export function useCategoryTypeQueries() {
	return useQueries({
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
}
