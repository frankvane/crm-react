import type { IUserInfo } from "@/types/api/common";
import { authApi } from "@/api/modules/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useTabStore } from "@/store/modules/tab";

interface IAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: IUserInfo | null;
  roles: any[];
  resources: any[];
  isAuthenticated: boolean;
}

interface IAuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: IUserInfo) => void;
  setRoles: (roles: any[]) => void;
  setResources: (resources: any[]) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<IAuthState & IAuthActions>()(
  persist(
    (set, get) => ({
      // State
      accessToken: null,
      refreshToken: null,
      user: null,
      roles: [],
      resources: [],
      isAuthenticated: false,

      // Actions
      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
        // 同时更新 localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      },

      setUser: (user: IUserInfo) => {
        set({ user });
      },

      setRoles: (roles: any[]) => {
        set({ roles });
      },

      setResources: (resources: any[]) => {
        set({ resources });
      },

      login: async (username: string, password: string) => {
        try {
          // 登录前清除所有标签页
          useTabStore.getState().removeAllTabs();

          const { accessToken, refreshToken, user } = await authApi.login({
            username,
            password,
          });
          get().setTokens(accessToken, refreshToken);
          get().setUser(user);
          // 登录后拉取用户信息
          await get().fetchCurrentUser();
        } catch (error) {
          // 清除可能存在的旧 token
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          throw error;
        }
      },

      logout: async () => {
        try {
          // 传递refreshToken
          await authApi.logout(get().refreshToken || "");
        } finally {
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            roles: [],
            resources: [],
            isAuthenticated: false,
          });
          // 清除 localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          // redirect
        }
      },

      refreshTokens: async () => {
        const currentRefreshToken = get().refreshToken;
        if (!currentRefreshToken) {
          throw new Error("No refresh token available");
        }

        try {
          const { accessToken, refreshToken } = await authApi.refreshToken(
            currentRefreshToken
          );
          get().setTokens(accessToken, refreshToken);
        } catch (error) {
          // 刷新失败时清除 token
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          throw error;
        }
      },

      fetchCurrentUser: async () => {
        try {
          const response = await authApi.getCurrentUser();
          const { user, roles, resources } = response;
          set({ user, roles, resources, isAuthenticated: true });
        } catch {
          set({ user: null, roles: [], resources: [], isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        roles: state.roles,
        resources: state.resources,
      }),
    }
  )
);
