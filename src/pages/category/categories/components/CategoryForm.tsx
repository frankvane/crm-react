import { Form, Input, Modal, message } from "antd";
import {
	createCategory,
	getCategory,
	getCategoryTree,
	updateCategory,
} from "@/api/modules/category";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { ICategory } from "@/types/api/category";
import { getAllCategoryTypes } from "@/api/modules/category-type";
import { useEffect } from "react";

interface CategoryFormProps {
	visible: boolean;
	id?: number;
	parentId?: number;
	typeId?: number;
	onCancel: () => void;
	onSuccess: () => void;
}

const CategoryForm = ({
	visible,
	id,
	parentId,
	typeId,
	onCancel,
	onSuccess,
}: CategoryFormProps) => {
	const [form] = Form.useForm();

	// 获取分类类型列表
	const { data: categoryTypes = [] } = useQuery({
		queryKey: ["allCategoryTypes"],
		queryFn: getAllCategoryTypes,
	});

	// 获取分类详情（编辑时）
	const { data: categoryData } = useQuery({
		queryKey: ["category", id],
		queryFn: () => getCategory(id as number),
		enabled: !!id,
	});

	// 获取同类型下的分类树
	const { data: categoryTree = [] } = useQuery({
		queryKey: ["categoryTree", typeId],
		queryFn: () => getCategoryTree(typeId!),
		enabled: !!typeId,
	});

	// 计算上级分类名称
	const parentName =
		categoryTree.find((cat) => cat.id === parentId)?.name ||
		(parentId ? parentId : "无");
	// 计算分类类型名称
	const typeName =
		categoryTypes.find((type) => type.id === typeId)?.name || "无";

	useEffect(() => {
		const fetchAndSet = async () => {
			if (visible) {
				if (id) {
					// 等待 categoryData 加载完成
					if (categoryData) {
						form.setFieldsValue(categoryData);
					}
				} else {
					form.resetFields();
				}
			}
		};
		fetchAndSet();
	}, [visible, id, categoryData, form]);

	const mutation = useMutation({
		mutationFn: (values: Partial<ICategory>) =>
			id ? updateCategory(id, values) : createCategory(values),
		onSuccess: () => {
			message.success(`${id ? "更新" : "创建"}分类成功`);
			onSuccess();
		},
	});

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			// 合并 typeId 和 parentId 字段
			const submitData = {
				...values,
				typeId,
				parentId,
			};
			mutation.mutate(submitData);
		} catch (error) {
			console.error("验证失败:", error);
		}
	};

	return (
		<Modal
			title={`${id ? "编辑" : "新增"}分类`}
			open={visible}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={mutation.isPending}
			destroyOnClose
		>
			<Form form={form} preserve={false} labelCol={{ span: 6 }}>
				<Form.Item
					name="name"
					label="分类名称"
					rules={[{ required: true, message: "请输入分类名称" }]}
				>
					<Input placeholder="请输入分类名称" />
				</Form.Item>
				<Form.Item
					name="code"
					label="分类编码"
					rules={[{ required: true, message: "请输入分类编码" }]}
				>
					<Input placeholder="请输入分类编码" />
				</Form.Item>
				<Form.Item label="分类类型">
					<Input value={typeName} disabled />
				</Form.Item>
				<Form.Item label="上级分类">
					<Input value={parentName} disabled />
				</Form.Item>
				<Form.Item name="description" label="描述">
					<Input.TextArea placeholder="请输入描述" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default CategoryForm;
