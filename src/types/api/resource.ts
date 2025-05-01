import type { IPaginationParams, IPaginationResponse } from "./common";

// 资源类型枚举
export enum ResourceType {
  MENU = "MENU",
  BUTTON = "BUTTON",
  API = "API",
}

// 资源接口
export interface IResource {
  id: number;
  name: string;
  code: string;
  type: ResourceType;
  path?: string;
  method?: string;
  icon?: string;
  parentId?: number;
  sort: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

// 创建资源参数
export interface ICreateResourceParams {
  name: string;
  code: string;
  type: ResourceType;
  path?: string;
  method?: string;
  icon?: string;
  parentId?: number;
  sort: number;
  status: number;
}

// 更新资源参数
export type IUpdateResourceParams = ICreateResourceParams;

// 资源查询参数
export interface IResourceQueryParams extends IPaginationParams {
  name?: string;
  code?: string;
  type?: ResourceType;
  status?: number;
}

// 资源列表响应
export type IResourceListResponse = IPaginationResponse<IResource>;

// 资源树节点
export interface IResourceTreeNode extends IResource {
  children?: IResourceTreeNode[];
}

// 资源树响应
export type IResourceTreeResponse = IResourceTreeNode[];
