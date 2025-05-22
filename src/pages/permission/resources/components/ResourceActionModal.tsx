import {
	Button,
	Form,
	Input,
	Modal,
	Space,
	Switch,
	Table,
	message,
} from "antd";
import type { IResource, IResourceAction } from "@/types/api/resource";
import {
	createResourceAction,
	deleteResourceAction,
	getResourceAction,
	getResourceActions,
	updateResourceAction,
} from "@/api/modules/resource";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useState } from "react";

interface ResourceActionModalProps {
	visible: boolean;
	resource: IResource | null;
	onCancel: () => void;
}

const ResourceActionModal: React.FC<ResourceActionModalProps> = ({
	visible,
	resource,
	onCancel,
}) => {
	const [form] = Form.useForm();
	const [editingAction, setEditingAction] = useState<IResourceAction | null>(
		null,
	);
	const [isEditLoading, setIsEditLoading] = useState(false);
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["resourceActions", resource?.id],
		queryFn: async () => {
			if (!resource?.id) return null;
			const response = await getResourceActions(resource.id);
			return response;
		},
		enabled: visible && !!resource?.id,
	});

	const actions = (data as any)?.list ?? [];

	// 创建/更新资源操作
	const actionMutation = useMutation({
		mutationFn: (values: Partial<IResourceAction>) =>
			editingAction
				? updateResourceAction(resource!.id, editingAction.id, values)
				: createResourceAction(resource!.id, values),
		onSuccess: () => {
			message.success(`${editingAction ? "更新" : "创建"}成功`);
			queryClient.invalidateQueries({
				queryKey: ["resourceActions", resource?.id],
			});
			queryClient.invalidateQueries({ queryKey: ["resourceTree"] });
			form.resetFields();
			setEditingAction(null);
		},
	});

	// 删除资源操作
	const deleteMutation = useMutation({
		mutationFn: (actionId: number) =>
			deleteResourceAction(resource!.id, actionId),
		onSuccess: () => {
			message.success("删除成功");
			queryClient.invalidateQueries({
				queryKey: ["resourceActions", resource?.id],
			});
			queryClient.invalidateQueries({ queryKey: ["resourceTree"] });
		},
	});

	const handleDelete = (actionId: number) => {
		Modal.confirm({
			title: "确认删除",
			content: "确定要删除这个资源操作吗？此操作不可恢复。",
			okText: "确认",
			cancelText: "取消",
			onOk: () => deleteMutation.mutate(actionId),
		});
	};

	const handleEdit = async (record: IResourceAction) => {
		try {
			setIsEditLoading(true);
			// 获取最新的资源操作数据
			const response = await getResourceAction(resource!.id, record.id);
			setEditingAction(response as unknown as IResourceAction);
			form.setFieldsValue(response);
		} catch (error: unknown) {
			console.error("Failed to fetch resource action:", error);
			message.error("获取资源操作详情失败");
		} finally {
			setIsEditLoading(false);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		setEditingAction(null);
		onCancel();
	};

	const columns = [
		{
			title: "操作名称",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "操作编码",
			dataIndex: "code",
			key: "code",
		},
		{
			title: "操作",
			key: "action",
			render: (_: unknown, record: IResourceAction) => (
				<Space>
					<Button type="link" onClick={() => handleEdit(record)}>
						编辑
					</Button>
					<Button type="link" danger onClick={() => handleDelete(record.id)}>
						删除
					</Button>
				</Space>
			),
		},
	];

	return (
		<Modal
			title={`资源操作管理 - ${resource?.name || ""}`}
			open={visible}
			onCancel={handleCancel}
			width={800}
			footer={null}
		>
			<Form
				form={form}
				onFinish={(values) => actionMutation.mutate(values)}
				layout="vertical"
				disabled={isEditLoading}
			>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
					}}
				>
					<Form.Item
						name="name"
						label="操作名称"
						rules={[{ required: true, message: "请输入操作名称" }]}
					>
						<Input placeholder="请输入操作名称" />
					</Form.Item>
					<Form.Item
						name="code"
						label="操作编码"
						rules={[{ required: true, message: "请输入操作编码" }]}
					>
						<Input placeholder="请输入操作编码" />
					</Form.Item>
					<Form.Item
						name="description"
						label="描述"
						style={{ gridColumn: "span 2" }}
					>
						<Input.TextArea placeholder="请输入描述" />
					</Form.Item>
					<Form.Item
						name="needConfirm"
						label="需要确认"
						valuePropName="checked"
					>
						<Switch />
					</Form.Item>
					<Form.Item
						name="confirmMessage"
						label="确认信息"
						dependencies={["needConfirm"]}
						rules={[
							({ getFieldValue }) => ({
								required: getFieldValue("needConfirm"),
								message: "启用确认时，确认信息为必填",
							}),
						]}
					>
						<Input placeholder="请输入确认信息" />
					</Form.Item>
				</div>
				<Form.Item style={{ marginBottom: 24, textAlign: "right" }}>
					<Space>
						{editingAction && (
							<Button
								onClick={() => {
									form.resetFields();
									setEditingAction(null);
								}}
							>
								取消
							</Button>
						)}
						<Button type="primary" htmlType="submit">
							{editingAction ? "更新" : "添加"}
						</Button>
					</Space>
				</Form.Item>
			</Form>

			<Table
				columns={columns}
				dataSource={actions}
				rowKey="id"
				loading={isLoading || isEditLoading}
			/>
		</Modal>
	);
};

export default ResourceActionModal;
