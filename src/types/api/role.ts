import type { IPaginationParams, IPaginationResponse } from "./common";

// 角色接口
export interface IRole {
  id: number;
  name: string;
  code: string;
  description: string;
  resourceIds: number[];
  status: number;
  createdAt: string;
  updatedAt: string;
}

// 创建角色参数
export interface ICreateRoleParams {
  name: string;
  code: string;
  description: string;
  resourceIds: number[];
  status: number;
}

// 更新角色参数
export type IUpdateRoleParams = ICreateRoleParams;

// 角色查询参数
export interface IRoleQueryParams extends IPaginationParams {
  name?: string;
  code?: string;
  status?: number;
}

// 角色列表响应
export type IRoleListResponse = IPaginationResponse<IRole>;

// 分配资源参数
export interface IAssignResourcesParams {
  roleId: number;
  resourceIds: number[];
  permissionIds: number[];
}
