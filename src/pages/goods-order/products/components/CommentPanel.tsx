import React, { memo } from "react";
import { Card, Space, Button, Typography, Spin, Empty } from "antd";
import CommentList from "./commentList";
import styles from "../style.module.less";
import { CommentPanelProps } from "../types";

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
			className={styles.categoryHeader}
			bodyStyle={{ padding: 0 }}
			bordered={false}
		>
			<div
				className={styles.categoryContent}
				style={{
					opacity: selectedProductId ? 1 : 0,
					pointerEvents: selectedProductId ? "auto" : "none",
					transition: "opacity 0.3s",
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
