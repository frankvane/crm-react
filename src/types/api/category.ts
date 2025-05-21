import type { IPaginationParams, IPaginationResponse } from "./common";

import type { ICategoryType } from "./category-type";

// 分类接口
export interface ICategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  typeId: number;
  type: ICategoryType;
  parentId?: number;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

// 创建分类参数
export interface ICreateCategoryParams {
  name: string;
  code: string;
  description?: string;
  typeId: number;
  parentId?: number;
  sort: number;
}

// 更新分类参数
export type IUpdateCategoryParams = ICreateCategoryParams;

// 分类查询参数
export interface ICategoryQueryParams extends IPaginationParams {
  name?: string;
  code?: string;
  typeId?: number;
}

// 分类列表响应
export type ICategoryListResponse = IPaginationResponse<ICategory>;

// 分类树节点
export interface ICategoryTreeNode extends ICategory {
  children?: ICategoryTreeNode[];
}

// 分类树响应
export type ICategoryTreeResponse = ICategoryTreeNode[];
