/**
 * ProductCardWrapper 组件
 * 用于简化 ProductCard 复合用法，支持常用属性直传和自动插槽渲染
 * 推荐用于商品列表、详情页等场景，自动集成图片、标题、价格、徽章、操作按钮等
 * @module ProductCardWrapper
 */
import { CSSProperties, ReactNode } from "react";

import ProductCard from "./index";
import { useProductActions } from "./hooks/useProductActions";

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
}

/**
 * ProductCardWrapper 组件
 * 封装 ProductCard 复合用法，自动渲染图片、标题、价格、徽章、操作按钮等
 * 支持自定义 children、footer、actions，适合商品卡片快速集成
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
}) => {
  const { isAddedToCart, isWishlisted, toggleCart, toggleWishlist } =
    useProductActions(productId) as {
      isAddedToCart: boolean;
      isWishlisted: boolean;
      toggleCart: () => void;
      toggleWishlist: () => void;
    };

  const renderActions = showActions
    ? () => (
        <>
          <ProductCard.ActionButton
            onClick={toggleCart}
            isActive={isAddedToCart}
          >
            {isAddedToCart ? "Remove from Cart" : " Add to Cart"}
          </ProductCard.ActionButton>
          <ProductCard.ActionButton
            onClick={toggleWishlist}
            isActive={isWishlisted}
          >
            {isWishlisted ? "Remove from Wishlist" : " Add to Wishlist"}
          </ProductCard.ActionButton>
        </>
      )
    : undefined;

  return (
    <ProductCard
      productId={productId}
      layout={layout}
      renderActions={renderActions}
      customFooter={customFooter}
      className={className}
      style={style}
    >
      {imageSrc && (
        <ProductCard.Image src={imageSrc} alt={title || "Product"} />
      )}

      {!!badgeType && (
        <ProductCard.Badge type={badgeType}>
          {badgeType || "甄选"}
        </ProductCard.Badge>
      )}

      {children || (
        <>
          {title && <ProductCard.Title>{title}</ProductCard.Title>}
          {price && <ProductCard.Price>{price}</ProductCard.Price>}
        </>
      )}
    </ProductCard>
  );
};

ProductCardWrapper.Title = ProductCard.Title;
ProductCardWrapper.Price = ProductCard.Price;
ProductCardWrapper.Image = ProductCard.Image;
ProductCardWrapper.Badge = ProductCard.Badge;
ProductCardWrapper.ActionButton = ProductCard.ActionButton;

export default ProductCardWrapper;
