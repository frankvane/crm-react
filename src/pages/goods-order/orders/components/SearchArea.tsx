import React from "react";
import { Form, Input, Button } from "antd";
import styles from "../style.module.less";

interface SearchAreaProps {
	onSearch?: (params: Record<string, any>) => void;
}

const SearchArea: React.FC<SearchAreaProps> = ({ onSearch }) => {
	const [searchForm] = Form.useForm();

	// 搜索
	const onFinish = (values: any) => {
		// 只传递有值的字段，避免无关参数
		const params: any = {};
		if (values.search) params.search = values.search;
		if (values.name) params.name = values.name;
		if (values.phone) params.phone = values.phone;
		if (values.id_card) params.id_card = values.id_card;
		onSearch?.(params);
	};

	return (
		<div className={styles.searchArea}>
			<Form
				form={searchForm}
				layout="vertical"
				onFinish={onFinish}
				className={styles.searchAreaForm}
			>
				<div className={styles.searchAreaFields}>
					<Form.Item
						label="关键词"
						name="search"
						className={styles.searchAreaItemSearch}
					>
						<Input
							placeholder="姓名/手机号/身份证/主治医师"
							className={styles.searchAreaInput}
						/>
					</Form.Item>
					<Form.Item
						label="姓名"
						name="name"
						className={styles.searchAreaItemName}
					>
						<Input
							placeholder="请输入姓名"
							className={styles.searchAreaInput}
						/>
					</Form.Item>
					<Form.Item
						label="手机号"
						name="phone"
						className={styles.searchAreaItemPhone}
					>
						<Input
							placeholder="请输入手机号"
							className={styles.searchAreaInput}
						/>
					</Form.Item>
					<Form.Item
						label="身份证号"
						name="id_card"
						className={styles.searchAreaItemIdCard}
					>
						<Input
							placeholder="请输入身份证号"
							className={styles.searchAreaInput}
						/>
					</Form.Item>
					<Form.Item className={styles.searchAreaItemBtn}>
						<Button
							type="primary"
							htmlType="submit"
							className={styles.searchAreaBtn}
						>
							搜索
						</Button>
					</Form.Item>
				</div>
			</Form>
		</div>
	);
};

export default SearchArea;
