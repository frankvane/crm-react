import { ReactNode, createContext, useContext, useState } from "react";

interface ProductState {
  cart: boolean;
  wishlist: boolean;
}

interface ProductContextValue {
  getProductState: (productId: string) => ProductState;
  toggleState: (productId: string, stateType: keyof ProductState) => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(
  undefined
);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [productStates, setProductStates] = useState<
    Record<string, ProductState>
  >({});

  const toggleState = (productId: string, stateType: keyof ProductState) => {
    setProductStates((prevStates) => {
      const currentProductState = prevStates[productId] || {
        cart: false,
        wishlist: false,
      };
      return {
        ...prevStates,
        [productId]: {
          ...currentProductState,
          [stateType]: !currentProductState[stateType],
        },
      };
    });
  };

  const getProductState = (productId: string): ProductState =>
    productStates[productId] || {
      cart: false,
      wishlist: false,
    };

  return (
    <ProductContext.Provider value={{ getProductState, toggleState }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = (): ProductContextValue => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
