import { Button, Card, Space } from "antd";
import { useAnyPermission, usePermission } from "@/hooks/usePermission";

import Permission from "@/components/Permission";
import React from "react";

const PermissionExample: React.FC = () => {
	// 使用 hooks 方式
	const canEdit = usePermission("permission:users:edit");
	const canDelete = usePermission("permission:users:delete");
	const canExport = useAnyPermission([
		"permission:users:export",
		"permission:roles:export",
	]);

	return (
		<Card title="权限控制示例">
			<Space direction="vertical" size="large">
				{/* 使用组件方式 */}
				<Space>
					<Permission permission="permission:users:add">
						<Button type="primary">创建用户</Button>
					</Permission>
					<Permission permission="permission:users:edit">
						<Button type="primary">编辑用户</Button>
					</Permission>
					<Permission permission="permission:users:delete">
						<Button type="primary" danger>
							删除用户
						</Button>
					</Permission>
				</Space>

				{/* 使用 hooks 方式 */}
				<Space>
					{canEdit && <Button type="primary">编辑用户</Button>}
					{canDelete && (
						<Button type="primary" danger>
							删除用户
						</Button>
					)}
					{canExport && <Button>导出数据</Button>}
				</Space>
			</Space>
		</Card>
	);
};

export default PermissionExample;
