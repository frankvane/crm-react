import {
	useQuery,
	useMutation,
	useQueryClient,
	UseMutationOptions,
} from "@tanstack/react-query";
import {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	changePassword,
	toggleUserStatus,
	assignRoles,
} from "@/api/modules/user";
import type {
	IUser,
	IUserQueryParams,
	ICreateUserParams,
	IUpdateUserParams,
	IChangePasswordParams,
} from "@/types/api/user";

// 获取用户列表
export function useUsersQuery(params: IUserQueryParams) {
	return useQuery({
		queryKey: ["users", params],
		queryFn: () => getUsers(params),
	});
}

// 获取单个用户
export function useUserQuery(id: number) {
	return useQuery({
		queryKey: ["user", id],
		queryFn: () => getUser(id),
		enabled: !!id,
	});
}

// 创建用户
export function useCreateUserMutation(
	options?: UseMutationOptions<IUser, Error, ICreateUserParams>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createUser,
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}

// 更新用户
export function useUpdateUserMutation(
	options?: UseMutationOptions<
		IUser,
		Error,
		{ id: number; data: IUpdateUserParams }
	>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }) => updateUser(id, data),
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}

// 删除用户
export function useDeleteUserMutation(
	options?: UseMutationOptions<null, Error, number>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteUser,
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}

// 修改密码
export function useChangePasswordMutation(
	options?: UseMutationOptions<null, Error, IChangePasswordParams>,
) {
	return useMutation({
		mutationFn: changePassword,
		...options,
	});
}

// 切换用户状态
export function useToggleUserStatusMutation(
	options?: UseMutationOptions<IUser, Error, number>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: toggleUserStatus,
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}

// 分配角色
export function useAssignRolesMutation(
	options?: UseMutationOptions<
		IUser,
		Error,
		{ id: number; data: { roleIds: number[] } }
	>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }) => assignRoles(id, data),
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}
