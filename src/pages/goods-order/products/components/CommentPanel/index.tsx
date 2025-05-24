/**
 * @file 文件描述
 * @author 开发人员
 * @date 2025-05-23
 * @last_modified_by 最后修改人
 * @last_modified_time 2025-05-23
 */

import React, { memo } from "react";
import { Card, Space, Button, Typography, Spin, Empty } from "antd";
import CommentList from "../commentList";
import styles from "./style.module.less";
import { CommentPanelProps } from "../../types";

const { Text } = Typography;

/**
 * 评论面板组件
 */
const CommentPanel: React.FC<CommentPanelProps> = ({
	selectedProductId,
	selectedProductName,
	onShowAiModal,
}) => {
	// 骨架屏状态
	const [loading, setLoading] = React.useState(true);

	// 模拟加载效果
	React.useEffect(() => {
		if (selectedProductId) {
			setLoading(true);
			const timer = setTimeout(() => {
				setLoading(false);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [selectedProductId]);

	return (
		<Card
			title={
				<Space>
					<Text>
						评论{selectedProductName ? `（${selectedProductName}）` : ""}
					</Text>
					{selectedProductId && (
						<Button type="link" size="small" onClick={onShowAiModal}>
							AI分析
						</Button>
					)}
				</Space>
			}
			className={styles.cardHeader}
			bodyStyle={{ padding: 0 }}
			bordered={false}
		>
			<div
				className={styles.content}
				style={{
					opacity: selectedProductId ? 1 : 0,
					pointerEvents: selectedProductId ? "auto" : "none",
					transition: "opacity 0.3s",
					height: "100%" /* 确保评论面板容器占满高度 */,
				}}
			>
				{selectedProductId ? (
					loading ? (
						<div className={styles.loadingContainer}>
							<Spin tip="加载评论中..." />
						</div>
					) : (
						<CommentList productId={selectedProductId} />
					)
				) : (
					<Empty description="请选择一个商品查看评论" />
				)}
			</div>
		</Card>
	);
};

export default memo(CommentPanel);
