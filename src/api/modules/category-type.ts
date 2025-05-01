import type {
  ICategoryType,
  ICategoryTypeListResponse,
  ICategoryTypeQueryParams,
} from "@/types/api/category-type";

import request from "@/utils/request";

// 获取所有分类类型（不分页）
export const getAllCategoryTypes = () =>
  request.get<ICategoryType[]>("/category-types/all");

// 获取分类类型列表
export const getCategoryTypes = (params: ICategoryTypeQueryParams) =>
  request.get<ICategoryTypeListResponse>("/category-types", { params });

// 获取单个分类类型
export const getCategoryType = (id: number) =>
  request.get<ICategoryType>(`/category-types/${id}`);

// 创建分类类型
export const createCategoryType = (data: Partial<ICategoryType>) =>
  request.post<ICategoryType>("/category-types", data);

// 更新分类类型
export const updateCategoryType = (id: number, data: Partial<ICategoryType>) =>
  request.put<ICategoryType>(`/category-types/${id}`, data);

// 删除分类类型
export const deleteCategoryType = (id: number) =>
  request.delete<void>(`/category-types/${id}`);
