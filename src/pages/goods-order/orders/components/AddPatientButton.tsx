/**
 * @file 添加患者按钮组件
 * @author AI Assistant
 * @date 2024-07-12
 */
import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { AddPatientButtonProps } from "../types";

/**
 * 添加患者按钮组件
 * @param props 组件属性
 * @returns React组件
 */
const AddPatientButton: React.FC<AddPatientButtonProps> = ({ onClick }) => {
	return (
		<Button
			type="primary"
			icon={<PlusOutlined />}
			onClick={onClick}
			size="large"
		>
			添加患者
		</Button>
	);
};

export default AddPatientButton;
