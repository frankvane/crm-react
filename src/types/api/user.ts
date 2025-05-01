import type { IPaginationParams, IPaginationResponse } from "./common";

// 角色接口
export interface IRole {
  id: number;
  name: string;
}

// 用户接口
export interface IUser {
  id: number;
  username: string;
  email: string;
  status: number;
  roles: IRole[];
  createdAt: string;
  updatedAt: string;
}

// 创建用户参数
export interface ICreateUserParams {
  username: string;
  email: string;
  password: string;
  roleIds: number[];
  status: number;
}

// 更新用户参数
export type IUpdateUserParams = Omit<ICreateUserParams, "password">;

// 用户查询参数
export interface IUserQueryParams extends IPaginationParams {
  username?: string;
  email?: string;
  status?: number;
}

// 用户列表响应
export type IUserListResponse = IPaginationResponse<IUser>;

// 修改密码参数
export interface IChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}
