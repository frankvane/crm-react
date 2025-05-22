/**
 * ProductCardWrapper 组件
 * 用于简化 ProductCard 复合用法，支持常用属性直传和自动插槽渲染
 * 推荐用于商品列表、详情页等场景，自动集成图片、标题、价格、徽章、操作按钮等
 * @module ProductCardWrapper
 */
import { CSSProperties, ReactNode } from "react";

import ProductCard from "./index";
import { useProductContext } from "./context/ProductContext";

/**
 * ProductCardWrapper 组件 props
 * @property {string} productId - 商品唯一标识（必填）
 * @property {"vertical"|"horizontal"} [layout="vertical"] - 布局方向
 * @property {string} [imageSrc] - 商品图片地址
 * @property {string} [title] - 商品标题
 * @property {ReactNode} [price] - 商品价格
 * @property {string} [badgeType] - 徽章类型
 * @property {ReactNode} [customFooter] - 自定义底部内容
 * @property {boolean} [showActions=true] - 是否显示操作按钮
 * @property {string} [className] - 自定义 className
 * @property {CSSProperties} [style] - 自定义样式
 * @property {ReactNode} [children] - 自定义内容（优先级高于 title/price）
 * @property {(productId: string, added: boolean) => void} [onAddToCart] - 加入购物车状态变更回调
 * @property {(productId: string, wishlisted: boolean) => void} [onWishlistChange] - 心愿单状态变更回调
 * @property {string} [addToCartText] - "加入购物车"按钮文案
 * @property {string} [removeFromCartText] - "移出购物车"按钮文案
 * @property {string} [addToWishlistText] - "加入心愿单"按钮文案
 * @property {string} [removeFromWishlistText] - "移出心愿单"按钮文案
 * @property {(params: {isAdded: boolean; onClick: () => void}) => ReactNode} [renderCartAction] - 自定义渲染购物车操作内容（icon/svg/自定义按钮等）
 * @property {(params: {isWishlisted: boolean; onClick: () => void}) => ReactNode} [renderWishlistAction] - 自定义渲染心愿单操作内容
 */
export interface ProductCardWrapperProps {
	productId: string;
	layout?: "vertical" | "horizontal";
	imageSrc?: string;
	title?: string;
	price?: ReactNode;
	badgeType?: string;
	customFooter?: ReactNode;
	showActions?: boolean;
	className?: string;
	style?: CSSProperties;
	children?: ReactNode;
	onAddToCart?: (productId: string, added: boolean) => void;
	onWishlistChange?: (productId: string, wishlisted: boolean) => void;
	addToCartText?: string;
	removeFromCartText?: string;
	addToWishlistText?: string;
	removeFromWishlistText?: string;
	/**
	 * 自定义渲染购物车操作内容（icon/svg/自定义按钮等）
	 */
	renderCartAction?: (params: {
		isAdded: boolean;
		onClick: () => void;
	}) => ReactNode;
	/**
	 * 自定义渲染心愿单操作内容
	 */
	renderWishlistAction?: (params: {
		isWishlisted: boolean;
		onClick: () => void;
	}) => ReactNode;
}

/**
 * ProductCardWrapper 组件
 * 封装 ProductCard 复合用法，自动渲染图片、标题、价格、徽章、操作按钮等
 * 支持自定义 children、footer、actions，适合商品卡片快速集成
 * 状态管理与全局 context 联动，支持外部回调
 * @param {ProductCardWrapperProps} props
 * @returns {JSX.Element}
 */
export const ProductCardWrapper: React.FC<ProductCardWrapperProps> & {
	Title: typeof ProductCard.Title;
	Price: typeof ProductCard.Price;
	Image: typeof ProductCard.Image;
	Badge: typeof ProductCard.Badge;
	ActionButton: typeof ProductCard.ActionButton;
} = ({
	productId,
	layout = "vertical",
	imageSrc,
	title,
	price,
	badgeType,
	customFooter,
	showActions = true,
	className = "",
	style = {},
	children,
	onAddToCart,
	onWishlistChange,
	addToCartText,
	removeFromCartText,
	addToWishlistText,
	removeFromWishlistText,
	renderCartAction,
	renderWishlistAction,
}) => {
	const { getProductState, toggleState } = useProductContext();
	const { cart: isAddedToCart, wishlist: isWishlisted } =
		getProductState(productId);

	const handleCart = () => {
		toggleState(productId, "cart");
		onAddToCart?.(productId, !isAddedToCart);
	};
	const handleWishlist = () => {
		toggleState(productId, "wishlist");
		onWishlistChange?.(productId, !isWishlisted);
	};

	const renderActions = showActions
		? () => (
				<>
					{renderCartAction ? (
						renderCartAction({
							isAdded: isAddedToCart,
							onClick: handleCart,
						})
					) : (
						<ProductCard.ActionButton
							onClick={handleCart}
							isActive={isAddedToCart}
						>
							{isAddedToCart
								? removeFromCartText || "移出购物车"
								: addToCartText || "加入购物车"}
						</ProductCard.ActionButton>
					)}
					{renderWishlistAction ? (
						renderWishlistAction({
							isWishlisted: isWishlisted,
							onClick: handleWishlist,
						})
					) : (
						<ProductCard.ActionButton
							onClick={handleWishlist}
							isActive={isWishlisted}
						>
							{isWishlisted
								? removeFromWishlistText || "移出心愿单"
								: addToWishlistText || "加入心愿单"}
						</ProductCard.ActionButton>
					)}
				</>
			)
		: undefined;

	// 只要有 props 内容（imageSrc、badgeType、title、price 任一），就只渲染 props 内容，children 必须为 null，彻底避免混用
	const hasPropsContent = !!(imageSrc || badgeType || title || price);

	// 严格分流：有 props 内容时 children 设为 null，无 props 内容时才传递 children
	const cardChildren = hasPropsContent ? (
		<>
			{imageSrc && (
				<ProductCard.Image src={imageSrc} alt={title || "Product"} />
			)}
			{!!badgeType && (
				<ProductCard.Badge type={badgeType}>
					{badgeType || "甄选"}
				</ProductCard.Badge>
			)}
			{title && <ProductCard.Title>{title}</ProductCard.Title>}
			{price && <ProductCard.Price>{price}</ProductCard.Price>}
		</>
	) : (
		children
	);

	return (
		<ProductCard
			productId={productId}
			layout={layout}
			renderActions={renderActions}
			customFooter={customFooter}
			className={className}
			style={style}
		>
			{cardChildren}
		</ProductCard>
	);
};

ProductCardWrapper.Title = ProductCard.Title;
ProductCardWrapper.Price = ProductCard.Price;
ProductCardWrapper.Image = ProductCard.Image;
ProductCardWrapper.Badge = ProductCard.Badge;
ProductCardWrapper.ActionButton = ProductCard.ActionButton;

export default ProductCardWrapper;
