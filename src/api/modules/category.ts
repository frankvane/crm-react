import type {
  ICategory,
  ICategoryListResponse,
  ICategoryQueryParams,
  ICategoryTreeResponse,
} from "@/types/api/category";

import request from "@/utils/request";

// 获取分类列表
export const getCategories = async (
  params: ICategoryQueryParams
): Promise<ICategoryListResponse> => {
  return request.get("/categories", { params });
};

// 获取分类树
export const getCategoryTree = async (
  typeId: number
): Promise<ICategoryTreeResponse> => {
  return request.get("/categories/tree", { params: { typeId } });
};

// 获取单个分类
export const getCategory = async (id: number): Promise<ICategory> => {
  return request.get(`/categories/${id}`);
};

// 创建分类
export const createCategory = async (
  data: Partial<ICategory>
): Promise<ICategory> => {
  return request.post("/categories", data);
};

// 更新分类
export const updateCategory = async (
  id: number,
  data: Partial<ICategory>
): Promise<ICategory> => {
  return request.put(`/categories/${id}`, data);
};

// 删除分类
export const deleteCategory = async (id: number): Promise<null> => {
  return request.delete(`/categories/${id}`);
};
