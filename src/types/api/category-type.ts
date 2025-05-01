export interface ICategoryType {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

// 创建分类类型参数
export interface ICreateCategoryTypeParams {
  name: string;
  code: string;
  description?: string;
}

// 更新分类类型参数
export type IUpdateCategoryTypeParams = ICreateCategoryTypeParams;

// 分类类型查询参数
export interface ICategoryTypeQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  name?: string;
  code?: string;
  description?: string;
}

// 分类类型列表响应
export interface ICategoryTypeListResponse {
  list: ICategoryType[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}
