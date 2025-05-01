import type {
  IChangePasswordParams,
  ICreateUserParams,
  IUpdateUserParams,
  IUser,
  IUserListResponse,
  IUserQueryParams,
} from "@/types/api/user";

import type { IResponse } from "@/types/api/common";
import request from "@/utils/request";

// 获取用户列表
export const getUsers = async (
  params: IUserQueryParams
): Promise<IResponse<IUserListResponse>> => {
  return request.get("/users", { params });
};

// 获取单个用户
export const getUser = async (id: number): Promise<IResponse<IUser>> => {
  return request.get(`/users/${id}`);
};

// 创建用户
export const createUser = async (
  data: ICreateUserParams
): Promise<IResponse<IUser>> => {
  return request.post("/users", data);
};

// 更新用户
export const updateUser = async (
  id: number,
  data: IUpdateUserParams
): Promise<IResponse<IUser>> => {
  return request.put(`/users/${id}`, data);
};

// 删除用户
export const deleteUser = async (id: number): Promise<IResponse<null>> => {
  return request.delete(`/users/${id}`);
};

// 修改密码
export const changePassword = async (
  data: IChangePasswordParams
): Promise<IResponse<null>> => {
  return request.post("/users/change-password", data);
};

// 切换用户状态
export const toggleUserStatus = async (
  id: number
): Promise<IResponse<IUser>> => {
  return request.patch(`/users/${id}/toggle-status`);
};
