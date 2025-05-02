import type {
  ICreateResourceParams,
  IResource,
  IResourceAction,
  IResourceListResponse,
  IResourceQueryParams,
  IResourceTreeResponse,
  IUpdateResourceParams,
} from "@/types/api/resource";

import type { IPaginationResponse } from "@/types/api/common";
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

export const getResourceActions = (resourceId: number) => {
  return request.get<IPaginationResponse<IResourceAction>>(
    `/resources/${resourceId}/actions`
  );
};

export const getResourceAction = (resourceId: number, actionId: number) => {
  return request.get<IResourceAction>(
    `/resources/${resourceId}/actions/${actionId}`
  );
};

export const createResourceAction = (
  resourceId: number,
  data: Partial<IResourceAction>
) => {
  return request.post<IResourceAction>(
    `/resources/${resourceId}/actions`,
    data
  );
};

export const updateResourceAction = (
  resourceId: number,
  actionId: number,
  data: Partial<IResourceAction>
) => {
  return request.put<IResourceAction>(
    `/resources/${resourceId}/actions/${actionId}`,
    data
  );
};

export const deleteResourceAction = (resourceId: number, actionId: number) => {
  return request.delete(`/resources/${resourceId}/actions/${actionId}`);
};
