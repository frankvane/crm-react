import ProductCard from "./index";
import React from "react";
import { useProductContext } from "./context/ProductContext";

export interface WithProductCardProps {
  productId: string;
  layout?: "vertical" | "horizontal";
  imageSrc?: string;
  title?: string;
  price?: React.ReactNode;
  badgeType?: string;
  customFooter?: React.ReactNode;
  showActions?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onAddToCart?: (productId: string, added: boolean) => void;
  onWishlistChange?: (productId: string, wishlisted: boolean) => void;
  addToCartText?: string;
  removeFromCartText?: string;
  addToWishlistText?: string;
  removeFromWishlistText?: string;
  renderCartAction?: (params: {
    isAdded: boolean;
    onClick: () => void;
  }) => React.ReactNode;
  renderWishlistAction?: (params: {
    isWishlisted: boolean;
    onClick: () => void;
  }) => React.ReactNode;
}

export function withProductCard<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const HOC: React.FC<P & WithProductCardProps> = (props) => {
    const {
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
      ...rest
    } = props;
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
        {/* 包裹内容组件，传递剩余 props */}
        <WrappedComponent {...(rest as P)} productId={productId}>
          {cardChildren}
        </WrappedComponent>
      </ProductCard>
    );
  };
  return HOC;
}
