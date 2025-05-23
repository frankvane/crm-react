/**
 * @file 文件描述
 * @author 开发人员
 * @date 2025-05-23
 * @last_modified_by 最后修改人
 * @last_modified_time 2025-05-23
 */

import React from "react";
import {
	Modal,
	Form,
	Input,
	InputNumber,
	Select,
	Row,
	Col,
	Switch,
} from "antd";
import { AddProductModalProps } from "@/products/types";
import styles from "./style.module.less";

/**
 * 添加产品弹窗组件
 */
const AddProductModal: React.FC<AddProductModalProps> = ({
	open,
	onOk,
	onCancel,
	brands,
	dosageForms,
	units,
	categories,
	confirmLoading,
}) => {
	const [form] = Form.useForm();

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			await onOk({
				...values,
				status: values.status ? 1 : 0, // 转换开关值为数字
			});
			form.resetFields();
		} catch (error) {
			console.error("Validate Failed:", error);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		onCancel();
	};

	return (
		<Modal
			title="添加产品"
			open={open}
			onOk={handleOk}
			onCancel={handleCancel}
			confirmLoading={confirmLoading}
			destroyOnClose
			width={800}
			className={styles.modal}
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={{
					status: true,
					price: 0,
					stock: 0,
				}}
				className={styles.form}
			>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							name="name"
							label="药品名称"
							rules={[
								{ required: true, message: "请输入药品名称" },
								{ max: 255, message: "药品名称不能超过255个字符" },
							]}
						>
							<Input placeholder="请输入药品名称" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="code"
							label="药品编码"
							rules={[{ max: 255, message: "药品编码不能超过255个字符" }]}
						>
							<Input placeholder="请输入药品编码/国药准字等" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="category_id"
							label="产品分类"
							rules={[{ required: true, message: "请选择产品分类" }]}
						>
							<Select
								placeholder="请选择产品分类"
								options={categories}
								showSearch
								optionFilterProp="label"
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="brand_id" label="品牌">
							<Select
								placeholder="请选择品牌"
								options={brands}
								showSearch
								optionFilterProp="label"
								allowClear
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="dosage_form_id" label="剂型">
							<Select
								placeholder="请选择剂型"
								options={dosageForms}
								showSearch
								optionFilterProp="label"
								allowClear
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="specification"
							label="规格"
							rules={[{ max: 255, message: "规格不能超过255个字符" }]}
						>
							<Input placeholder="请输入规格" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="manufacturer"
							label="生产厂家"
							rules={[{ max: 255, message: "生产厂家不能超过255个字符" }]}
						>
							<Input placeholder="请输入生产厂家" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="approval_number"
							label="批准文号"
							rules={[{ max: 255, message: "批准文号不能超过255个字符" }]}
						>
							<Input placeholder="请输入批准文号/国药准字" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="bar_code"
							label="条形码"
							rules={[{ max: 255, message: "条形码不能超过255个字符" }]}
						>
							<Input placeholder="请输入条形码" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="price"
							label="零售价"
							rules={[{ type: "number", min: 0, message: "零售价不能小于0" }]}
						>
							<InputNumber
								style={{ width: "100%" }}
								precision={2}
								min={0}
								placeholder="请输入零售价"
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="stock"
							label="库存数量"
							rules={[{ type: "number", min: 0, message: "库存数量不能小于0" }]}
						>
							<InputNumber
								style={{ width: "100%" }}
								precision={0}
								min={0}
								placeholder="请输入库存数量"
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="unit_id" label="单位">
							<Select
								placeholder="请选择单位"
								options={units}
								showSearch
								optionFilterProp="label"
								allowClear
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="image_url"
							label="产品图片"
							rules={[{ max: 255, message: "图片URL不能超过255个字符" }]}
						>
							<Input placeholder="请输入图片URL" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="status" label="上架状态" valuePropName="checked">
							<Switch checkedChildren="上架" unCheckedChildren="下架" />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="description" label="说明书/描述">
							<Input.TextArea rows={3} placeholder="请输入说明书/描述" />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};

export default AddProductModal;
