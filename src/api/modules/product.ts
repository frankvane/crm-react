import type {
  Product,
  ProductListResponse,
  ProductQueryParams,
  CreateProductParams,
  UpdateProductParams,
} from "@/types/api/product";

import request from "@/utils/request";

// 获取产品列表
export const getProducts = async (
  params: ProductQueryParams
): Promise<ProductListResponse> => {
  return request.get("/product", { params });
};

// 获取单个产品
export const getProduct = async (id: number): Promise<Product> => {
  return request.get(`/product/${id}`);
};

// 创建产品
export const createProduct = async (
  data: CreateProductParams
): Promise<Product> => {
  return request.post("/product", data);
};

// 更新产品
export const updateProduct = async (
  id: number,
  data: UpdateProductParams
): Promise<Product> => {
  return request.put(`/product/${id}`, data);
};

// 删除产品
export const deleteProduct = async (id: number): Promise<null> => {
  return request.delete(`/product/${id}`);
};

// 批量删除产品
export const deleteProducts = async (ids: number[]): Promise<{ deleted: number }> => {
  return request.delete("/product", { data: { ids } });
};