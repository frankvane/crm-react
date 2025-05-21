import { useState } from "react";

/**
 * useProductActions hook
 * 提供商品的本地购物车/心愿单状态及切换方法（演示用，实际业务建议与 ProductContext 联动）
 * @param {string} productId - 商品唯一标识
 * @returns {UseProductActionsResult} 商品状态与操作方法
 */

/**
 * useProductActions 返回值类型
 * @property {boolean} isAddedToCart - 是否已加入购物车
 * @property {boolean} isWishlisted - 是否已加入心愿单
 * @property {() => void} toggleCart - 切换购物车状态
 * @property {() => void} toggleWishlist - 切换心愿单状态
 */
export interface UseProductActionsResult {
  isAddedToCart: boolean;
  isWishlisted: boolean;
  toggleCart: () => void;
  toggleWishlist: () => void;
}

export const useProductActions = (
  productId: string
): UseProductActionsResult => {
  const [isAddedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setWishlisted] = useState(false);

  /**
   * 切换购物车状态
   */
  const toggleCart = () => {
    setAddedToCart((prevState) => !prevState);
    console.log(
      !isAddedToCart
        ? "Added to cart" + productId
        : "Removed from cart" + productId
    );
  };

  /**
   * 切换心愿单状态
   */
  const toggleWishlist = () => {
    setWishlisted((prevState) => !prevState);
    console.log(
      !isWishlisted
        ? "Added to wishlist" + productId
        : "Removed from wishlist" + productId
    );
  };

  return {
    isAddedToCart,
    isWishlisted,
    toggleCart,
    toggleWishlist,
  };
};
