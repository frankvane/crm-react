import React from "react";
import { useAuthStore } from "@/store/modules/auth";

interface IPermission {
	id: number;
	name: string;
	code: string;
}

interface IRole {
	id: number;
	name: string;
	code: string;
	permissions: IPermission[];
}

/**
 * 检查是否有权限
 * @param permission 权限标识
 * @returns 是否有权限
 */
export function usePermission(permission: string): boolean {
	const { roles } = useAuthStore();

	return React.useMemo(() => {
		// 检查所有角色中是否有对应的权限
		return roles.some((role: IRole) =>
			role.permissions.some((p: IPermission) => p.code === permission),
		);
	}, [permission, roles]);
}

/**
 * 检查是否有多个权限中的任意一个
 * @param permissions 权限标识数组
 * @returns 是否有权限
 */
export function useAnyPermission(permissions: string[]): boolean {
	const { roles } = useAuthStore();

	return React.useMemo(() => {
		return roles.some((role: IRole) =>
			role.permissions.some((p: IPermission) => permissions.includes(p.code)),
		);
	}, [permissions, roles]);
}

/**
 * 检查是否有多个权限中的所有权限
 * @param permissions 权限标识数组
 * @returns 是否有权限
 */
export function useAllPermissions(permissions: string[]): boolean {
	const { roles } = useAuthStore();

	return React.useMemo(() => {
		return roles.some((role: IRole) =>
			permissions.every((permission) =>
				role.permissions.some((p: IPermission) => p.code === permission),
			),
		);
	}, [permissions, roles]);
}
