import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import {
  getResources,
  getResourceTree,
  getResourceTreeWithActions,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  toggleResourceStatus,
} from '@/api/modules/resource';
import type { IResource, IResourceQueryParams, ICreateResourceParams, IUpdateResourceParams } from '@/types/api/resource';

// 获取资源列表
export function useResourcesQuery(params: IResourceQueryParams) {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: () => getResources(params),
  });
}

// 获取资源树
export function useResourceTreeQuery() {
  return useQuery({
    queryKey: ['resourceTree'],
    queryFn: getResourceTree,
  });
}

// 获取带操作的资源树
export function useResourceTreeWithActionsQuery() {
  return useQuery({
    queryKey: ['resourceTreeWithActions'],
    queryFn: getResourceTreeWithActions,
  });
}

// 获取单个资源
export function useResourceQuery(id: number) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => getResource(id),
    enabled: !!id,
  });
}

// 创建资源
export function useCreateResourceMutation(options?: UseMutationOptions<IResource, Error, ICreateResourceParams>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createResource,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 更新资源
export function useUpdateResourceMutation(options?: UseMutationOptions<IResource, Error, { id: number; data: IUpdateResourceParams }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateResource(id, data),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 删除资源
export function useDeleteResourceMutation(options?: UseMutationOptions<null, Error, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteResource,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 切换资源状态
export function useToggleResourceStatusMutation(options?: UseMutationOptions<IResource, Error, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleResourceStatus,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 资源操作相关 hooks 可按需补充 