import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import {
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/modules/category';
import type {
  ICategory,
  ICategoryQueryParams,
} from '@/types/api/category';

// 获取分类列表
export function useCategoriesQuery(params: ICategoryQueryParams) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params),
  });
}

// 获取分类树
export function useCategoryTreeQuery(typeId: number) {
  return useQuery({
    queryKey: ['categoryTree', typeId],
    queryFn: () => getCategoryTree(typeId),
    enabled: !!typeId,
  });
}

// 获取单个分类
export function useCategoryQuery(id: number) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategory(id),
    enabled: !!id,
  });
}

// 创建分类
export function useCreateCategoryMutation(options?: UseMutationOptions<ICategory, Error, Partial<ICategory>>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 更新分类
export function useUpdateCategoryMutation(options?: UseMutationOptions<ICategory, Error, { id: number; data: Partial<ICategory> }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 删除分类
export function useDeleteCategoryMutation(options?: UseMutationOptions<null, Error, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
} 