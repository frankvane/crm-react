import { useState } from "react";

interface UseProductActionsResult {
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

  const toggleCart = () => {
    setAddedToCart((prevState) => !prevState);
    console.log(
      !isAddedToCart
        ? "Added to cart" + productId
        : "Removed from cart" + productId
    );
  };

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
