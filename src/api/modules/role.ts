import type {
  IAssignResourcesParams,
  ICreateRoleParams,
  IRole,
  IRoleListResponse,
  IRoleQueryParams,
  IUpdateRoleParams,
} from "@/types/api/role";

import request from "@/utils/request";

// 获取所有角色（不分页）
export const getAllRoles = async (): Promise<IRole[]> => {
  return request.get("/roles/all");
};

// 获取角色列表
export const getRoles = async (
  params: IRoleQueryParams
): Promise<IRoleListResponse> => {
  return request.get("/roles", { params });
};

// 获取单个角色
export const getRole = async (id: number): Promise<IRole> => {
  return request.get(`/roles/${id}`);
};

// 创建角色
export const createRole = async (data: ICreateRoleParams): Promise<IRole> => {
  return request.post("/roles", data);
};

// 更新角色
export const updateRole = async (
  id: number,
  data: IUpdateRoleParams
): Promise<IRole> => {
  return request.put(`/roles/${id}`, data);
};

// 删除角色
export const deleteRole = async (id: number): Promise<null> => {
  return request.delete(`/roles/${id}`);
};

// 切换角色状态
export const toggleRoleStatus = async (id: number): Promise<IRole> => {
  return request.patch(`/roles/${id}/toggle-status`);
};

// 分配资源
export const assignResources = async (
  data: IAssignResourcesParams
): Promise<IRole> => {
  return request.post(`/roles/${data.roleId}/resources`, {
    resourceIds: data.resourceIds,
  });
};

// 获取角色已分配资源及操作
export const getRoleResources = async (roleId: number) => {
  return request.get(`/roles/${roleId}/resources`);
};
