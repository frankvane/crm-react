import React, { CSSProperties, MouseEventHandler, ReactNode } from "react";

import styles from "./style.module.less";
import { useProductContext } from "./context/ProductContext";

interface ProductCardImageProps {
  src: string;
  alt?: string;
}
const ProductCardImage: React.FC<ProductCardImageProps> = ({ src, alt }) => {
  return (
    <div className={styles.productImage}>
      <img src={src} alt={alt} />
    </div>
  );
};

interface ProductCardTitleProps {
  children: ReactNode;
}
const ProductCardTitle: React.FC<ProductCardTitleProps> = ({ children }) => {
  return <div className={styles.productTitle}>{children}</div>;
};

interface ProductCardPriceProps {
  children: ReactNode;
}
const ProductCardPrice: React.FC<ProductCardPriceProps> = ({ children }) => {
  return <div className={styles.productPrice}>{children}</div>;
};

interface ProductCardBadgeProps {
  children: ReactNode;
  type?: string;
}
const ProductCardBadge: React.FC<ProductCardBadgeProps> = ({
  children,
  type,
}) => {
  const badgeTypeClass = type
    ? type === "premium"
      ? styles.productBadgePremium
      : styles.productBadgeDefault
    : "";
  return (
    <div className={`${styles.productBadge} ${badgeTypeClass}`}>{children}</div>
  );
};

interface ProductCardActionButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
}
const ProductCardActionButton: React.FC<ProductCardActionButtonProps> = ({
  children,
  onClick,
  isActive,
}) => {
  return (
    <button
      className={
        isActive
          ? `${styles.actionButton} ${styles.actionButtonActive}`
          : `${styles.actionButton} ${styles.actionButtonNotActive}`
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export interface ProductCardProps {
  productId: string;
  children: ReactNode;
  customFooter?: ReactNode;
  renderActions?: (params: {
    isAddedToCart: boolean;
    isWishlisted: boolean;
    toggleCart: () => void;
    toggleWishlist: () => void;
  }) => ReactNode;
  layout?: "vertical" | "horizontal";
  className?: string;
  style?: CSSProperties;
}

const ProductCard: React.FC<ProductCardProps> & {
  Image: typeof ProductCardImage;
  Title: typeof ProductCardTitle;
  Price: typeof ProductCardPrice;
  Badge: typeof ProductCardBadge;
  ActionButton: typeof ProductCardActionButton;
} = ({
  productId,
  children,
  customFooter,
  renderActions,
  layout = "vertical",
  className = "",
  style = {},
}) => {
  const { getProductState, toggleState } = useProductContext();
  const { cart, wishlist } = getProductState(productId);

  const layoutClass =
    layout === "horizontal"
      ? styles.productCardHorizontal
      : styles.productCardVertical;

  const findChildComponent = (ComponentType: React.ElementType) =>
    React.Children.toArray(children).find(
      (child: any) => child.type === ComponentType
    );

  const filterChildrenComponents = (ComponentType: React.ElementType) =>
    React.Children.toArray(children).filter(
      (child: any) => child.type !== ComponentType
    );

  const imageComponent = findChildComponent(ProductCardImage);
  const badgeComponent = findChildComponent(ProductCardBadge);
  const otherComponents = filterChildrenComponents(ProductCardImage).filter(
    (child: any) => child.type !== ProductCardBadge
  );

  return (
    <div
      className={`${styles.productCard} ${layoutClass} ${className}`}
      style={style}
    >
      <div className={styles.productImageContainer}>
        {imageComponent}
        {badgeComponent}
      </div>

      <div className={styles.productDetails}>
        {otherComponents}
        {renderActions && (
          <div className={styles.productActions}>
            {renderActions({
              isAddedToCart: cart,
              isWishlisted: wishlist,
              toggleCart: () => toggleState(productId, "cart"),
              toggleWishlist: () => toggleState(productId, "wishlist"),
            })}
          </div>
        )}

        {customFooter && (
          <div className={styles.productFooter}>{customFooter}</div>
        )}
      </div>
    </div>
  );
};

ProductCard.Image = ProductCardImage;
ProductCard.Title = ProductCardTitle;
ProductCard.Price = ProductCardPrice;
ProductCard.Badge = ProductCardBadge;
ProductCard.ActionButton = ProductCardActionButton;

ProductCardImage.displayName = "ProductCard.Image";
ProductCardTitle.displayName = "ProductCard.Title";
ProductCardPrice.displayName = "ProductCard.Price";
ProductCardBadge.displayName = "ProductCard.Badge";
ProductCardActionButton.displayName = "ProductCard.ActionButton";
ProductCard.displayName = "ProductCard";

export default ProductCard;
