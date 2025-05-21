import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import {
  getAllRoles,
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
  assignResources,
} from '@/api/modules/role';
import type {
  IRole,
  IRoleQueryParams,
  ICreateRoleParams,
  IUpdateRoleParams,
  IAssignResourcesParams,
} from '@/types/api/role';

// 获取所有角色（不分页）
export function useAllRolesQuery() {
  return useQuery({
    queryKey: ['allRoles'],
    queryFn: getAllRoles,
  });
}

// 获取角色列表
export function useRolesQuery(params: IRoleQueryParams) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => getRoles(params),
  });
}

// 获取单个角色
export function useRoleQuery(id: number) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => getRole(id),
    enabled: !!id,
  });
}

// 创建角色
export function useCreateRoleMutation(options?: UseMutationOptions<IRole, Error, ICreateRoleParams>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 更新角色
export function useUpdateRoleMutation(options?: UseMutationOptions<IRole, Error, { id: number; data: IUpdateRoleParams }>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateRole(id, data),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 删除角色
export function useDeleteRoleMutation(options?: UseMutationOptions<null, Error, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 切换角色状态
export function useToggleRoleStatusMutation(options?: UseMutationOptions<IRole, Error, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleRoleStatus,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// 分配资源
export function useAssignResourcesMutation(options?: UseMutationOptions<IRole, Error, IAssignResourcesParams>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignResources,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      options?.onSuccess?.(data, variables, context);
    },
  });
} 