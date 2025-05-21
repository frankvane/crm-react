import type {
  ICategoryType,
  ICategoryTypeListResponse,
  ICategoryTypeQueryParams,
} from "@/types/api/category-type";

import request from "@/utils/request";

// 获取分类类型列表
export const getCategoryTypes = async (
  params: ICategoryTypeQueryParams
): Promise<ICategoryTypeListResponse> => {
  return request.get("/category-types", { params });
};

// 获取所有分类类型（不分页）
export const getAllCategoryTypes = async (): Promise<ICategoryType[]> => {
  return request.get("/category-types/all");
};

// 获取单个分类类型
export const getCategoryType = async (id: number): Promise<ICategoryType> => {
  return request.get(`/category-types/${id}`);
};

// 创建分类类型
export const createCategoryType = async (
  data: Partial<ICategoryType>
): Promise<ICategoryType> => {
  return request.post("/category-types", data);
};

// 更新分类类型
export const updateCategoryType = async (
  id: number,
  data: Partial<ICategoryType>
): Promise<ICategoryType> => {
  return request.put(`/category-types/${id}`, data);
};

// 删除分类类型
export const deleteCategoryType = async (id: number): Promise<null> => {
  return request.delete(`/category-types/${id}`);
};
