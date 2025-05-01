import type { IUserInfo } from "@/types/api/common";
import { authApi } from "@/api/modules/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: IUserInfo | null;
  isAuthenticated: boolean;
}

interface IAuthActions {
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: IUserInfo) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

export const useAuthStore = create<IAuthState & IAuthActions>()(
  persist(
    (set, get) => ({
      // State
      accessToken: null,
      refreshToken: null,
      user: null,
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

      login: async (username: string, password: string) => {
        try {
          const { accessToken, refreshToken, user } = await authApi.login({
            username,
            password,
          });
          get().setTokens(accessToken, refreshToken);
          get().setUser(user);
        } catch (error) {
          // 清除可能存在的旧 token
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
          });
          // 清除 localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
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
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
