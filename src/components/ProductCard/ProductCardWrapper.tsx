import { CSSProperties, ReactNode } from "react";

import ProductCard from "./index";
import { useProductActions } from "./hooks/useProductActions";

interface ProductCardWrapperProps {
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
