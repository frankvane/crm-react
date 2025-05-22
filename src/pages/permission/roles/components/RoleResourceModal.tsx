import { Checkbox, Modal, Spin, Tree, message } from "antd";
import { assignResources, getRoleResources } from "@/api/modules/role";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { getResourceTreeWithActions } from "@/api/modules/resource";

interface RoleResourceModalProps {
	visible: boolean;
	roleId?: number;
	onCancel: () => void;
	onSuccess: () => void;
}

const RoleResourceModal = ({
	visible,
	roleId,
	onCancel,
	onSuccess,
}: RoleResourceModalProps) => {
	const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
	const [actionChecked, setActionChecked] = useState<Record<number, number[]>>(
		{},
	); // resourceId -> actionIds
	const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

	// 获取带操作的资源树
	const { data: resourceTree = [], isLoading } = useQuery<unknown[]>({
		queryKey: ["resourceTreeWithActions"],
		queryFn: getResourceTreeWithActions,
		enabled: visible,
	});

	// 获取角色已分配资源
	const { data: roleResources = [] } = useQuery<unknown[]>({
		queryKey: ["roleResources", roleId],
		queryFn: () => getRoleResources(roleId!),
		enabled: visible && !!roleId,
	});

	// 资源树所有 id 扁平化
	function getAllNodeIds(nodes: unknown[]): number[] {
		let ids: number[] = [];
		(nodes as any[]).forEach((n) => {
			if (n && typeof n.id === "number") {
				ids.push(n.id);
				if (Array.isArray(n.children))
					ids = ids.concat(getAllNodeIds(n.children));
			}
		});
		return ids;
	}

	// 处理资源树节点勾选
	const onCheck = (checked: any) => {
		setCheckedKeys(checked);
	};

	// 处理操作勾选
	const onActionCheck = (resourceId: number, checkedActionIds: number[]) => {
		setActionChecked((prev) => ({ ...prev, [resourceId]: checkedActionIds }));
	};

	// 提交分配
	const mutation = useMutation({
		mutationFn: async () => {
			// 组装提交数据
			const data = {
				roleId: roleId!,
				resourceIds: checkedKeys as number[],
				permissionIds: Object.values(actionChecked).flat(),
			};
			await assignResources(data);
		},
		onSuccess: () => {
			message.success("分配资源成功");
			onSuccess();
		},
	});

	// 渲染资源树节点
	const renderTreeNodes = (nodes: unknown[]): any[] =>
		Array.isArray(nodes)
			? (nodes as any[]).map((node) => ({
					title: (
						<div
							style={{ display: "flex", alignItems: "center", width: "100%" }}
						>
							<span
								style={{
									minWidth: 180,
									flexShrink: 0,
									display: "inline-block",
								}}
							>
								{node.name}
							</span>
							<div
								style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
							>
								{Array.isArray(node.actions) && node.actions.length > 0 && (
									<Checkbox.Group
										options={node.actions.map((a: any) => ({
											label: a.name,
											value: a.id,
										}))}
										value={actionChecked[node.id] || []}
										onChange={(checked) =>
											onActionCheck(node.id, checked as number[])
										}
									/>
								)}
							</div>
						</div>
					),
					key: node.id,
					children: node.children ? renderTreeNodes(node.children) : undefined,
				}))
			: [];

	useEffect(() => {
		if (visible) {
			setExpandedKeys(getAllNodeIds(resourceTree)); // 默认全部展开
			if (roleId && Array.isArray(roleResources) && roleResources.length) {
				setCheckedKeys(roleResources.map((r: any) => r.id));
				const actionCheckedInit: Record<number, number[]> = {};
				(roleResources as any[]).forEach((r: any) => {
					actionCheckedInit[r.id] = (r.actions || []).map(
						(a: { id: number }) => a.id,
					);
				});
				setActionChecked(actionCheckedInit);
			} else {
				setCheckedKeys([]);
				setActionChecked({});
			}
		}
		// 依赖 resourceTree/roleResources/visible
	}, [visible, resourceTree, roleResources, roleId]);

	return (
		<Modal
			title="分配资源"
			open={visible}
			onCancel={onCancel}
			onOk={() => mutation.mutate()}
			confirmLoading={mutation.isPending}
			width={800}
			destroyOnClose
		>
			<Spin spinning={isLoading}>
				<Tree
					checkable
					checkedKeys={checkedKeys}
					onCheck={onCheck}
					expandedKeys={expandedKeys}
					onExpand={setExpandedKeys}
					treeData={renderTreeNodes(resourceTree)}
				/>
			</Spin>
		</Modal>
	);
};

export default RoleResourceModal;
