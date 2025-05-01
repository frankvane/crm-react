import type {
  ICreateUserParams,
  IUpdateUserParams,
  IUser,
  IUserListResponse,
  IUserQueryParams,
} from "@/types/api/user";

import request from "@/utils/request";

// 获取用户列表
export const getUsers = (
  params: IUserQueryParams
): Promise<IUserListResponse> => {
  return request.get("/users", { params });
};

// 创建用户
export const createUser = (data: ICreateUserParams): Promise<IUser> => {
  return request.post("/users", data);
};

// 更新用户
export const updateUser = (
  id: number,
  data: IUpdateUserParams
): Promise<IUser> => {
  return request.put(`/users/${id}`, data);
};

// 删除用户
export const deleteUser = (id: number): Promise<void> => {
  return request.delete(`/users/${id}`);
};

// 更新用户状态
export const updateUserStatus = (
  id: number,
  status: number
): Promise<IUser> => {
  return request.patch(`/users/${id}/status`, { status });
};
