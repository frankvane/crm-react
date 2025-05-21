import type {
  IChangePasswordParams,
  ICreateUserParams,
  IUpdateUserParams,
  IUser,
  IUserListResponse,
  IUserQueryParams,
} from "@/types/api/user";

import request from "@/utils/request";

// 获取用户列表
export const getUsers = async (
  params: IUserQueryParams
): Promise<IUserListResponse> => {
  return request.get("/users", { params });
};

// 获取单个用户
export const getUser = async (id: number): Promise<IUser> => {
  return request.get(`/users/${id}`);
};

// 创建用户
export const createUser = async (data: ICreateUserParams): Promise<IUser> => {
  return request.post("/users", data);
};

// 更新用户
export const updateUser = async (
  id: number,
  data: IUpdateUserParams
): Promise<IUser> => {
  return request.put(`/users/${id}`, data);
};

// 删除用户
export const deleteUser = async (id: number): Promise<null> => {
  return request.delete(`/users/${id}`);
};

// 修改密码
export const changePassword = async (
  data: IChangePasswordParams
): Promise<null> => {
  return request.post("/users/change-password", data);
};

// 切换用户状态
export const toggleUserStatus = async (id: number): Promise<IUser> => {
  return request.patch(`/users/${id}/toggle-status`);
};

// 分配角色
export interface IAssignRolesParams {
  roleIds: number[];
}

export const assignRoles = async (
  id: number,
  data: IAssignRolesParams
): Promise<IUser> => {
  return request.post(`/users/${id}/roles`, data);
};
