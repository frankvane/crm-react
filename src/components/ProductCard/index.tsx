/**
 * ProductCard 组件及子组件类型与注释统一导出
 * 支持商品卡片的图片、标题、价格、徽章、操作按钮等复合结构
 * @module ProductCard
 */

import React, { CSSProperties, MouseEventHandler, ReactNode } from "react";

import styles from "./style.module.less";
import { useProductContext } from "./context/ProductContext";

/**
 * 商品图片组件 props
 * @property {string} src - 图片地址（必填）
 * @property {string} [alt] - 图片 alt 文本
 */
export interface ProductCardImageProps {
  /** 图片地址 */
  src: string;
  /** 图片 alt 文本 */
  alt?: string;
}
/**
 * 商品图片组件
 */
const ProductCardImage: React.FC<ProductCardImageProps> = ({ src, alt }) => {
  return (
    <div className={styles.productImage}>
      <img src={src} alt={alt} />
    </div>
  );
};

/**
 * 商品标题组件 props
 * @property {ReactNode} children - 标题内容（必填）
 */
export interface ProductCardTitleProps {
  /** 标题内容 */
  children: ReactNode;
}
/**
 * 商品标题组件
 */
const ProductCardTitle: React.FC<ProductCardTitleProps> = ({ children }) => {
  return <div className={styles.productTitle}>{children}</div>;
};

/**
 * 商品价格组件 props
 * @property {ReactNode} children - 价格内容（必填）
 */
export interface ProductCardPriceProps {
  /** 价格内容 */
  children: ReactNode;
}
/**
 * 商品价格组件
 */
const ProductCardPrice: React.FC<ProductCardPriceProps> = ({ children }) => {
  return <div className={styles.productPrice}>{children}</div>;
};

/**
 * 商品徽章组件 props
 * @property {ReactNode} children - 徽章内容（必填）
 * @property {string} [type] - 徽章类型（如 'premium'）
 */
export interface ProductCardBadgeProps {
  /** 徽章内容 */
  children: ReactNode;
  /** 徽章类型 */
  type?: string;
}
/**
 * 商品徽章组件
 */
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

/**
 * 操作按钮组件 props
 * @property {ReactNode} children - 按钮内容（必填）
 * @property {MouseEventHandler<HTMLButtonElement>} [onClick] - 点击事件
 * @property {boolean} [isActive] - 是否激活态
 */
export interface ProductCardActionButtonProps {
  /** 按钮内容 */
  children: ReactNode;
  /** 点击事件 */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** 是否激活态 */
  isActive?: boolean;
}
/**
 * 操作按钮组件
 */
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

/**
 * 通用分区插槽 Section props
 * @property {string} name - 分区名称（如 desc/shop/promotion/自定义）
 * @property {ReactNode} children - 分区内容
 */
export interface ProductCardSectionProps {
  name: string;
  children: React.ReactNode;
}
/**
 * 通用分区插槽 Section
 */
const ProductCardSection: React.FC<ProductCardSectionProps> = ({
  children,
}) => <>{children}</>;

/**
 * renderActions 参数上下文类型，支持扩展
 */
export interface ProductCardActionContext {
  isAddedToCart: boolean;
  isWishlisted: boolean;
  toggleCart: () => void;
  toggleWishlist: () => void;
  productId: string;
  children: React.ReactNode;
  productData?: any;
  extra?: any;
}

/**
 * ProductCard 主组件 props
 * @property {string} productId - 商品唯一标识（必填）
 * @property {ReactNode} children - 子组件内容（必填，推荐使用 ProductCard.Image、Title、Price、Badge 等）
 * @property {ReactNode} [customFooter] - 自定义底部内容
 * @property {(params: ProductCardActionContext) => ReactNode} [renderActions] - 自定义操作按钮渲染函数
 * @property {"vertical"|"horizontal"} [layout="vertical"] - 布局方向
 * @property {string} [className] - 自定义 className
 * @property {CSSProperties} [style] - 自定义样式
 */
export interface ProductCardProps {
  /** 商品唯一标识 */
  productId: string;
  /** 子组件内容 */
  children: ReactNode;
  /** 自定义底部内容 */
  customFooter?: ReactNode;
  /**
   * 自定义操作按钮渲染函数
   * @param params 当前商品的购物车/心愿单状态与切换方法
   */
  renderActions?: (params: ProductCardActionContext) => ReactNode;
  /** 布局方向 */
  layout?: "vertical" | "horizontal";
  /** 自定义 className */
  className?: string;
  /** 自定义样式 */
  style?: CSSProperties;
}
/**
 * ProductCard 主组件
 * 支持图片、标题、价格、徽章、操作按钮等复合结构
 */
const ProductCard: React.FC<ProductCardProps> & {
  Image: typeof ProductCardImage;
  Title: typeof ProductCardTitle;
  Price: typeof ProductCardPrice;
  Badge: typeof ProductCardBadge;
  ActionButton: typeof ProductCardActionButton;
  Section: typeof ProductCardSection;
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

  const imageComponent = findChildComponent(ProductCardImage);
  const badgeComponent = findChildComponent(ProductCardBadge);

  const sections: Record<string, React.ReactNode[]> = {};
  const otherChildren: React.ReactNode[] = [];
  React.Children.forEach(children, (child: any) => {
    if (child && child.type === ProductCardSection && child.props?.name) {
      if (!sections[child.props.name]) sections[child.props.name] = [];
      sections[child.props.name].push(child);
    } else {
      otherChildren.push(child);
    }
  });

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
        {otherChildren}
        {renderActions && (
          <div className={styles.productActions}>
            {renderActions({
              isAddedToCart: cart,
              isWishlisted: wishlist,
              toggleCart: () => toggleState(productId, "cart"),
              toggleWishlist: () => toggleState(productId, "wishlist"),
              productId,
              children,
              productData: {},
              extra: {},
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
ProductCard.Section = ProductCardSection;

ProductCardImage.displayName = "ProductCard.Image";
ProductCardTitle.displayName = "ProductCard.Title";
ProductCardPrice.displayName = "ProductCard.Price";
ProductCardBadge.displayName = "ProductCard.Badge";
ProductCardActionButton.displayName = "ProductCard.ActionButton";
ProductCardSection.displayName = "ProductCard.Section";
ProductCard.displayName = "ProductCard";

export default ProductCard;
