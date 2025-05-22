import { Form, Input, Modal, Select, message } from "antd";
import type {
	ICreateRoleParams,
	IRole,
	IUpdateRoleParams,
} from "@/types/api/role";
import { createRole, getRole, updateRole } from "@/api/modules/role";
import { useEffect, useState } from "react";

import { useMutation } from "@tanstack/react-query";

interface IRoleFormProps {
	visible: boolean;
	editingRole: IRole | null;
	onCancel: () => void;
	onSuccess: () => void;
}

const RoleForm: React.FC<IRoleFormProps> = ({
	visible,
	editingRole,
	onCancel,
	onSuccess,
}) => {
	const [form] = Form.useForm<ICreateRoleParams>();
	const [loading, setLoading] = useState(false);

	// 创建角色
	const createMutation = useMutation({
		mutationFn: (data: ICreateRoleParams) => createRole(data),
		onSuccess: () => {
			message.success("创建成功");
			onSuccess();
		},
	});

	// 更新角色
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: IUpdateRoleParams }) =>
			updateRole(id, data),
		onSuccess: () => {
			message.success("更新成功");
			onSuccess();
		},
	});

	// 监听表单可见性变化，编辑时实时请求数据回显
	useEffect(() => {
		const fetchAndSet = async () => {
			if (visible) {
				if (editingRole) {
					setLoading(true);
					try {
						const role = await getRole(editingRole.id);
						form.setFieldsValue(role);
					} catch {
						message.error("获取角色数据失败，请重试");
					} finally {
						setLoading(false);
					}
				} else {
					form.resetFields();
				}
			}
		};
		fetchAndSet();
	}, [visible, editingRole, form]);

	// 处理表单提交
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (editingRole) {
				updateMutation.mutate({
					id: editingRole.id,
					data: values,
				});
			} else {
				createMutation.mutate(values);
			}
		} catch (error) {
			// 表单验证失败
			console.error("Validate Failed:", error);
		}
	};

	return (
		<Modal
			title={editingRole ? "编辑角色" : "新增角色"}
			open={visible}
			onOk={handleSubmit}
			onCancel={onCancel}
			confirmLoading={
				createMutation.isPending || updateMutation.isPending || loading
			}
		>
			<Form<ICreateRoleParams>
				form={form}
				layout="horizontal"
				initialValues={{ status: 1 }}
				labelCol={{ span: 6 }}
			>
				<Form.Item
					name="name"
					label="角色名称"
					rules={[{ required: true, message: "请输入角色名称" }]}
				>
					<Input placeholder="请输入角色名称" />
				</Form.Item>

				<Form.Item
					name="code"
					label="角色编码"
					rules={[{ required: true, message: "请输入角色编码" }]}
				>
					<Input placeholder="请输入角色编码" />
				</Form.Item>

				<Form.Item
					name="description"
					label="描述"
					rules={[{ required: true, message: "请输入描述" }]}
				>
					<Input.TextArea placeholder="请输入描述" rows={4} />
				</Form.Item>

				<Form.Item
					name="status"
					label="状态"
					rules={[{ required: true, message: "请选择状态" }]}
				>
					<Select
						placeholder="请选择状态"
						options={[
							{ label: "启用", value: 1 },
							{ label: "禁用", value: 0 },
						]}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default RoleForm;
