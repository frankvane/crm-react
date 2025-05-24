import {
	useQuery,
	useMutation,
	UseMutationOptions,
} from "@tanstack/react-query";
import { authApi } from "@/api/modules/auth";
import type { ILoginParams } from "@/types/api/common";

// 登录
export function useLoginMutation(
	options?: UseMutationOptions<any, Error, ILoginParams>,
) {
	return useMutation({
		mutationFn: authApi.login,
		...options,
	});
}

// 登出
export function useLogoutMutation(
	options?: UseMutationOptions<any, Error, string>,
) {
	return useMutation({
		mutationFn: authApi.logout,
		...options,
	});
}

// 刷新 token
export function useRefreshTokenMutation(
	options?: UseMutationOptions<any, Error, string>,
) {
	return useMutation({
		mutationFn: authApi.refreshToken,
		...options,
	});
}

// 获取当前用户
export function useCurrentUserQuery() {
	return useQuery({
		queryKey: ["currentUser"],
		queryFn: authApi.getCurrentUser,
	});
}
