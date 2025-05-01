import type { ILoginParams, ILoginResult } from "@/types/api/common";

import request from "@/utils/request";

interface IRefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (data: ILoginParams): Promise<ILoginResult> =>
    request.post("/auth/login", data),

  logout: () => request.post("/auth/logout"),

  refreshToken: (refreshToken: string): Promise<IRefreshTokenResult> =>
    request.post("/auth/refresh", {
      refreshToken,
    }),

  getCurrentUser: () => request.get("/auth/current-user"),
};
