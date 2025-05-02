import type {
  ICreateResourceParams,
  IResource,
  IResourceAction,
  IResourceListResponse,
  IResourceQueryParams,
  IResourceTreeResponse,
  IUpdateResourceParams,
} from "@/types/api/resource";

import request from "@/utils/request";

// 获取资源列表
export const getResources = async (
  params: IResourceQueryParams
): Promise<IResourceListResponse> => {
  return request.get("/resources", { params });
};

// 获取资源树
export const getResourceTree = async (): Promise<IResourceTreeResponse> => {
  return request.get("/resources/tree");
};

// 获取单个资源
export const getResource = async (id: number): Promise<IResource> => {
  return request.get(`/resources/${id}`);
};

// 创建资源
export const createResource = async (
  data: ICreateResourceParams
): Promise<IResource> => {
  return request.post("/resources", data);
};

// 更新资源
export const updateResource = async (
  id: number,
  data: IUpdateResourceParams
): Promise<IResource> => {
  return request.put(`/resources/${id}`, data);
};

// 删除资源
export const deleteResource = async (id: number): Promise<null> => {
  return request.delete(`/resources/${id}`);
};

// 切换资源状态
export const toggleResourceStatus = async (id: number): Promise<IResource> => {
  return request.patch(`/resources/${id}/toggle-status`);
};

export const getResourceActions = async (
  resourceId: number
): Promise<IResourceAction[]> => {
  const response = await request.get<IResourceAction[]>(
    `/resources/${resourceId}/actions`
  );
  return response.data;
};

export const createResourceAction = async (
  resourceId: number,
  data: Partial<IResourceAction>
): Promise<IResourceAction> => {
  const response = await request.post<IResourceAction>(
    `/resources/${resourceId}/actions`,
    data
  );
  return response.data;
};

export const updateResourceAction = async (
  resourceId: number,
  actionId: number,
  data: Partial<IResourceAction>
): Promise<IResourceAction> => {
  const response = await request.put<IResourceAction>(
    `/resources/${resourceId}/actions/${actionId}`,
    data
  );
  return response.data;
};

export const deleteResourceAction = async (
  resourceId: number,
  actionId: number
): Promise<void> => {
  await request.delete(`/resources/${resourceId}/actions/${actionId}`);
};
