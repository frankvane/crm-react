/**
 * ProductContext 提供全局商品购物车/心愿单状态管理
 * 通过 context 实现跨组件共享商品状态，支持 getProductState、toggleState 方法
 * @module ProductContext
 */
import { ReactNode, createContext, useContext, useState } from "react";

/**
 * 商品状态类型
 * @property {boolean} cart - 是否已加入购物车
 * @property {boolean} wishlist - 是否已加入心愿单
 */
export interface ProductState {
  cart: boolean;
  wishlist: boolean;
}

/**
 * ProductContext 提供的值类型
 * @property {(productId: string) => ProductState} getProductState - 获取指定商品状态
 * @property {(productId: string, stateType: keyof ProductState) => void} toggleState - 切换指定商品的购物车/心愿单状态
 */
export interface ProductContextValue {
  getProductState: (productId: string) => ProductState;
  toggleState: (productId: string, stateType: keyof ProductState) => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(
  undefined
);

/**
 * ProductProvider 组件
 * 提供全局商品状态 context，需包裹在应用根节点或需要共享状态的组件外层
 * @param {ReactNode} children - 子组件
 * @returns {JSX.Element}
 */
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [productStates, setProductStates] = useState<
    Record<string, ProductState>
  >({});

  /**
   * 切换指定商品的购物车/心愿单状态
   * @param {string} productId - 商品唯一标识
   * @param {keyof ProductState} stateType - 状态类型（cart/wishlist）
   */
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

  /**
   * 获取指定商品的购物车/心愿单状态
   * @param {string} productId - 商品唯一标识
   * @returns {ProductState}
   */
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

/**
 * useProductContext hook
 * 获取全局商品状态 context，必须在 ProductProvider 内部使用
 * @returns {ProductContextValue}
 * @throws {Error} 未在 ProductProvider 内使用时抛出异常
 */
export const useProductContext = (): ProductContextValue => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
