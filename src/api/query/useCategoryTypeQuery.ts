import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import {
  getCategoryTypes,
  getAllCategoryTypes,
  getCategoryType,
  createCategoryType,
  updateCategoryType,
  deleteCategoryType,
} from '@/api/modules/category-type';
import type {
  ICategoryType,
  ICategoryTypeQueryParams,
} from '@/types/api/category-type';

// 获取分类类型列表
export function useCategoryTypesQuery(params: ICategoryTypeQueryParams) {
  return useQuery({
    queryKey: ['categoryTypes', params],
    queryFn: () => getCategoryTypes(params),
  });
}

// 获取所有分类类型（不分页）
export function useAllCategoryTypesQuery() {
  return useQuery({
    queryKey: ['allCategoryTypes'],
    queryFn: getAllCategoryTypes,
  });
}

// 获取单个分类类型
export function useCategoryTypeQuery(id: number) {
  return useQuery({
    queryKey: ['categoryType', id],
    queryFn: () => getCategoryType(id),
    enabled: !!id,
  });
}

// 创建分类类型
export function useCreateCategoryTypeMutation(options?: UseMutationOptions<ICategoryType, Error, Partial<ICategoryType>>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategoryType,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categoryTypes'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 更新分类类型
export function useUpdateCategoryTypeMutation(options?: UseMutationOptions<ICategoryType, Error, { id: number; data: Partial<ICategoryType> }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCategoryType(id, data),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categoryTypes'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 删除分类类型
export function useDeleteCategoryTypeMutation(options?: UseMutationOptions<null, Error, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategoryType,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categoryTypes'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}
