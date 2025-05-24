import React, { useEffect, useState, useRef, useCallback } from "react";
import { getProducts } from "@/api/modules/product";
import { FixedSizeList as List } from "react-window";
import { Spin, Empty, Skeleton, Image } from "antd";
import styles from "./style.module.less";

const PAGE_SIZE = 20;

interface ProductListProps {
	categoryId?: string;
	onShowComments?: (productId: number | string, productName: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
	categoryId,
	onShowComments,
}) => {
	const [products, setProducts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const totalRef = useRef<number | null>(null);
	// 记录图片加载状态
	const [imgLoaded, setImgLoaded] = useState<{ [key: string]: boolean }>({});

	// 处理图片加载完成事件
	const handleImageLoad = useCallback((id: string | number) => {
		setImgLoaded((prev) => ({
			...prev,
			[id]: true,
		}));
	}, []);

	// 分类变化时重置并加载
	useEffect(() => {
		setLoading(true);
		setProducts([]);
		setPage(1);
		setHasMore(true);
		setImgLoaded({});
		getProducts({ page: 1, pageSize: PAGE_SIZE, category_id: categoryId })
			.then((res) => {
				const list = res?.list || [];
				const total = res?.pagination?.total || 0;
				setProducts(list);
				totalRef.current = total;
				setHasMore(list.length < total);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [categoryId]);

	// 加载更多
	const loadMore = useCallback(() => {
		if (fetchingMore || !hasMore) return;
		setFetchingMore(true);
		getProducts({
			page: page + 1,
			pageSize: PAGE_SIZE,
			category_id: categoryId,
		})
			.then((res) => {
				const list = res?.list || [];
				setProducts((prev) => [...prev, ...list]);
				setPage((prev) => prev + 1);
				const total = totalRef.current;
				setHasMore(products.length + list.length < (total || 0));
				setFetchingMore(false);
			})
			.catch(() => setFetchingMore(false));
	}, [fetchingMore, hasMore, page, products.length, categoryId]);

	// 虚拟列表滚动到底部时加载更多
	const handleItemsRendered = useCallback(
		({ visibleStopIndex }: { visibleStopIndex: number }) => {
			if (hasMore && !fetchingMore && visibleStopIndex >= products.length - 5) {
				loadMore();
			}
		},
		[hasMore, fetchingMore, products.length, loadMore],
	);

	if (loading) return <Spin style={{ width: "100%", marginTop: 40 }} />;
	if (!products.length)
		return <Empty description="暂无产品" style={{ marginTop: 40 }} />;

	const minCount = Math.ceil(600 / 108); // 保证撑满600px高度
	const totalCount = Math.max(products.length, minCount);

	const Row = ({
		index,
		style,
	}: {
		index: number;
		style: React.CSSProperties;
	}) => {
		if (index >= products.length) {
			// 空白占位行
			return <div style={{ ...style, background: "#fff" }} />;
		}
		const item = products[index];
		return (
			<div
				className={
					index % 2 === 0
						? `${styles.productRow} ${styles.productRowEven}`
						: styles.productRow
				}
				style={style}
			>
				<div
					style={{
						position: "relative",
						width: 56,
						height: 56,
						marginRight: 16,
					}}
				>
					<Image
						src={item.image_url}
						alt={item.name}
						className={styles.productImage}
						loading="lazy"
						width={56}
						height={56}
						preview={{ mask: "点击预览大图" }}
						placeholder={
							<Skeleton.Image style={{ width: 56, height: 56 }} active />
						}
						onLoad={() => handleImageLoad(item.id)}
						style={{
							opacity: imgLoaded[item.id] ? 1 : 0.6,
							transition: "opacity 0.3s ease",
						}}
					/>
				</div>
				<div className={styles.productInfo} style={{ flex: 3 }}>
					<div className={styles.productName}>{item.name}</div>
					<div className={styles.productSpec}>规格：{item.specification}</div>
					<div className={styles.productManu}>厂家：{item.manufacturer}</div>
					<div className={styles.productManu}>
						批准文号：{item.approval_number}
					</div>
					<div className={styles.productManu}>条形码：{item.bar_code}</div>
				</div>
				<div className={styles.productPrice}>{item.price} 元</div>
				<div className={styles.productStock}>库存: {item.stock}</div>
				<div
					style={{
						flex: 1,
						color: item.status === 1 ? "#52c41a" : "#d4380d",
						fontWeight: 500,
					}}
				>
					{item.status === 1 ? "上架" : "下架"}
				</div>
				<div style={{ flex: 1, color: "#888", fontSize: 12 }}>
					{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
				</div>
				<div style={{ flex: "none", marginLeft: 16 }}>
					<button
						style={{
							padding: "4px 12px",
							border: "1px solid #1890ff",
							borderRadius: 4,
							background: "#fff",
							color: "#1890ff",
							cursor: "pointer",
						}}
						onClick={() => onShowComments && onShowComments(item.id, item.name)}
					>
						查看评论
					</button>
				</div>
			</div>
		);
	};

	return (
		<>
			<List
				height={600}
				itemCount={totalCount}
				itemSize={108}
				width={"100%"}
				onItemsRendered={({ visibleStopIndex }) =>
					handleItemsRendered({ visibleStopIndex })
				}
			>
				{Row}
			</List>
			{fetchingMore && (
				<div style={{ textAlign: "center", padding: 8 }}>
					<Spin size="small" /> 加载更多...
				</div>
			)}
			{!hasMore && products.length > 0 && (
				<div style={{ textAlign: "center", color: "#888", padding: 8 }}>
					没有更多数据
				</div>
			)}
		</>
	);
};

export default ProductList;
