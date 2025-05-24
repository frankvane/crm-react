/**
 * @file 搜索区域组件
 * @author AI Assistant
 * @date 2024-07-12
 */
import React from "react";
import { Form, Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import styles from "../style.module.less";
import { SearchAreaProps } from "../types";

/**
 * 搜索区域组件
 * @param props 组件属性
 * @returns React组件
 */
const SearchArea: React.FC<SearchAreaProps> = ({ onSearch }) => {
	const [form] = Form.useForm();

	const handleSearch = (values: any) => {
		onSearch(values);
	};

	const handleReset = () => {
		form.resetFields();
		onSearch({});
	};

	return (
		<div className={styles.searchArea}>
			<Form
				form={form}
				layout="horizontal"
				className={styles.searchAreaForm}
				onFinish={handleSearch}
			>
				<div className={styles.searchAreaFields}>
					<Form.Item name="keyword" className={styles.searchAreaItemSearch}>
						<Input
							placeholder="请输入姓名/手机号/身份证号"
							className={styles.searchAreaInput}
							allowClear
							prefix={<SearchOutlined />}
						/>
					</Form.Item>
					<Form.Item name="name" className={styles.searchAreaItemName}>
						<Input
							placeholder="姓名"
							className={styles.searchAreaInput}
							allowClear
						/>
					</Form.Item>
					<Form.Item name="phone" className={styles.searchAreaItemPhone}>
						<Input
							placeholder="手机号"
							className={styles.searchAreaInput}
							allowClear
						/>
					</Form.Item>
					<Form.Item name="id_card" className={styles.searchAreaItemIdCard}>
						<Input
							placeholder="身份证号"
							className={styles.searchAreaInput}
							allowClear
						/>
					</Form.Item>
					<Form.Item className={styles.searchAreaItemBtn}>
						<Button
							type="primary"
							htmlType="submit"
							className={styles.searchAreaBtn}
							icon={<SearchOutlined />}
						>
							搜索
						</Button>
					</Form.Item>
					<Form.Item>
						<Button onClick={handleReset}>重置</Button>
					</Form.Item>
				</div>
			</Form>
		</div>
	);
};

export default SearchArea;
