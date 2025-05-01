// 通用响应接口
export interface IResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 分页参数接口
export interface IPaginationParams {
  page: number;
  pageSize: number;
}

// 分页数据接口
export interface IPagination {
  current: number;
  pageSize: number;
  total: number;
}

// 分页响应接口
export interface IPaginationResponse<T> {
  list: T[];
  pagination: IPagination;
}

export interface ILoginParams {
  username: string;
  password: string;
}

export interface ILoginResult {
  accessToken: string;
  refreshToken: string;
  user: IUserInfo;
}

export interface IUserInfo {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}
