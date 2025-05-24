import { Form, Modal, Select, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { IRole } from "@/types/api/role";
import { assignRoles } from "@/api/modules/user";
import { getAllRoles } from "@/api/modules/role";

interface AssignRolesProps {
	visible: boolean;
	userId?: number;
	currentRoles?: number[];
	onCancel: () => void;
}

const AssignRoles = ({
	visible,
	userId,
	currentRoles = [],
	onCancel,
}: AssignRolesProps) => {
	const [form] = Form.useForm();
	const queryClient = useQueryClient();

	// 获取所有角色
	const { data: roles = [] } = useQuery<IRole[]>({
		queryKey: ["allRoles"],
		queryFn: getAllRoles,
	});

	// 分配角色
	const assignRolesMutation = useMutation({
		mutationFn: (values: { roleIds: number[] }) =>
			assignRoles(userId as number, values),
		onSuccess: () => {
			message.success("角色分配成功");
			queryClient.invalidateQueries({ queryKey: ["users"] });
			onCancel();
		},
	});

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			assignRolesMutation.mutate(values);
		} catch (error) {
			console.error("验证失败:", error);
		}
	};

	// 将当前角色ID转换为对应的角色对象
	const defaultRoles = roles.filter((role: IRole) =>
		currentRoles.includes(role.id),
	);

	return (
		<Modal
			title="分配角色"
			open={visible}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={assignRolesMutation.isPending}
			destroyOnClose
		>
			<Form
				form={form}
				initialValues={{ roleIds: defaultRoles.map((role: IRole) => role.id) }}
				preserve={false}
			>
				<Form.Item
					name="roleIds"
					label="角色"
					rules={[{ required: true, message: "请选择角色" }]}
				>
					<Select
						mode="multiple"
						placeholder="请选择角色"
						allowClear
						style={{ width: "100%" }}
						options={roles.map((role: IRole) => ({
							label: role.name,
							value: role.id,
							disabled: role.status === 0, // 禁用状态为0的角色
						}))}
						optionFilterProp="label"
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default AssignRoles;
