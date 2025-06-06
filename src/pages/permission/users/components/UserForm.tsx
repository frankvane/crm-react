import { Form, Input, Modal, Select, message } from "antd";
import type {
	ICreateUserParams,
	IUpdateUserParams,
	IUser,
} from "@/types/api/user";
import { createUser, getUser, updateUser } from "@/api/modules/user";
import { useEffect, useState } from "react";

import { useMutation } from "@tanstack/react-query";

interface IUserFormProps {
	visible: boolean;
	editingUser: IUser | null;
	onCancel: () => void;
	onSuccess: () => void;
}

const UserForm: React.FC<IUserFormProps> = ({
	visible,
	editingUser,
	onCancel,
	onSuccess,
}) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);

	// 创建用户
	const createMutation = useMutation({
		mutationFn: (data: ICreateUserParams) => createUser(data),
		onSuccess: () => {
			message.success("创建成功");
			onSuccess();
		},
	});

	// 更新用户
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: IUpdateUserParams }) =>
			updateUser(id, data),
		onSuccess: () => {
			message.success("更新成功");
			onSuccess();
		},
	});

	// 监听表单可见性变化，编辑时实时请求数据回显
	useEffect(() => {
		const fetchAndSet = async () => {
			if (visible) {
				if (editingUser) {
					setLoading(true);
					try {
						const user = await getUser(editingUser.id);
						const formData = {
							...user,
							roleIds: user.roles.map((role) => role.id),
						};
						form.setFieldsValue(formData);
					} catch {
						message.error("获取用户数据失败，请重试");
					} finally {
						setLoading(false);
					}
				} else {
					form.resetFields();
				}
			}
		};
		fetchAndSet();
	}, [visible, editingUser, form]);

	// 处理表单提交
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			if (editingUser) {
				updateMutation.mutate({
					id: editingUser.id,
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
			title={editingUser ? "编辑用户" : "新增用户"}
			open={visible}
			onOk={handleSubmit}
			onCancel={onCancel}
			confirmLoading={
				createMutation.isPending || updateMutation.isPending || loading
			}
		>
			<Form
				form={form}
				layout="horizontal"
				initialValues={{ status: 1 }}
				labelCol={{ span: 6 }}
			>
				<Form.Item
					name="username"
					label="用户名"
					rules={[{ required: true, message: "请输入用户名" }]}
				>
					<Input placeholder="请输入用户名" />
				</Form.Item>

				<Form.Item
					name="email"
					label="邮箱"
					rules={[
						{ required: true, message: "请输入邮箱" },
						{ type: "email", message: "请输入有效的邮箱地址" },
					]}
				>
					<Input placeholder="请输入邮箱" />
				</Form.Item>

				{!editingUser && (
					<Form.Item
						name="password"
						label="密码"
						rules={[
							{ required: true, message: "请输入密码" },
							{ min: 6, message: "密码长度不能小于 6 位" },
						]}
					>
						<Input.Password placeholder="请输入密码" />
					</Form.Item>
				)}

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

export default UserForm;
