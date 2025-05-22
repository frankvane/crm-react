import React, { memo } from "react";
import { Button, Row, Col, Space, Tooltip } from "antd";
import {
	PlusOutlined,
	FilterOutlined,
	ReloadOutlined,
} from "@ant-design/icons";
import styles from "../style.module.less";
import { ProductOperationBarProps } from "../types";

/**
 * 产品操作栏组件
 */
const ProductOperationBar: React.FC<ProductOperationBarProps> = ({
	onAddProduct,
	isLoading,
}) => {
	return (
		<Row className={styles.operationBar} justify="space-between" align="middle">
			<Col>
				<Space>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={onAddProduct}
						loading={isLoading}
					>
						添加商品
					</Button>
					<Tooltip title="筛选商品">
						<Button icon={<FilterOutlined />}>筛选</Button>
					</Tooltip>
				</Space>
			</Col>
			<Col>
				<Tooltip title="刷新数据">
					<Button icon={<ReloadOutlined />} />
				</Tooltip>
			</Col>
		</Row>
	);
};

export default memo(ProductOperationBar);
