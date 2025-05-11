import ProductCardWrapper from "@/components/ProductCard/ProductCardWrapper";
import { ProductProvider } from "@/components/ProductCard/context/ProductContext";
import React from "react";

const LogisticsDemo: React.FC = () => {
  // 示例回调
  const handleAddToCart = (productId: string, added: boolean) => {
    console.log(`${added ? "加入" : "移除"}购物车: ${productId}`);
  };
  const handleWishlistChange = (productId: string, wishlisted: boolean) => {
    console.log(`${wishlisted ? "加入" : "移除"}心愿单: ${productId}`);
  };

  return (
    <ProductProvider>
      <div style={{ display: "flex", gap: 24 }}>
        <ProductCardWrapper
          productId="p1"
          imageSrc="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80"
          title="时尚运动鞋"
          price={"¥99.00"}
          badgeType="premium"
          onAddToCart={handleAddToCart}
          onWishlistChange={handleWishlistChange}
        />
        <ProductCardWrapper
          productId="p2"
          imageSrc="https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80"
          title="现代风格椅子"
          price={"¥199.00"}
          badgeType="default"
          onAddToCart={handleAddToCart}
          onWishlistChange={handleWishlistChange}
        />
        {/* 新增：自定义操作按钮示例 */}
        <ProductCardWrapper
          productId="p4"
          imageSrc="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
          title="自定义操作商品"
          price={"¥299.00"}
          badgeType="premium"
          onAddToCart={handleAddToCart}
          onWishlistChange={handleWishlistChange}
          renderCartAction={({ isAdded, onClick }) => (
            <span
              onClick={onClick}
              style={{
                cursor: "pointer",
                color: isAdded ? "red" : "gray",
                fontSize: 20,
                marginRight: 8,
              }}
              title={isAdded ? "移出购物车" : "加入购物车"}
            >
              {isAdded ? "🛒✔️" : "🛒"}
            </span>
          )}
          renderWishlistAction={({ isWishlisted, onClick }) => (
            <span
              onClick={onClick}
              style={{
                cursor: "pointer",
                color: isWishlisted ? "gold" : "gray",
                fontSize: 20,
              }}
              title={isWishlisted ? "移出心愿单" : "加入心愿单"}
            >
              {isWishlisted ? "❤️" : "🤍"}
            </span>
          )}
        />
        {/* 插槽用法示例：自定义 children 完全自定义内容结构 */}
        <ProductCardWrapper
          productId="p3"
          onAddToCart={handleAddToCart}
          onWishlistChange={handleWishlistChange}
        >
          <ProductCardWrapper.Image
            src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
            alt="定制商品"
          />
          <ProductCardWrapper.Badge type="premium">
            限量
          </ProductCardWrapper.Badge>
          <ProductCardWrapper.Title>定制插槽商品</ProductCardWrapper.Title>
          <ProductCardWrapper.Price>¥299.00</ProductCardWrapper.Price>
          <div style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
            自定义底部内容
          </div>
        </ProductCardWrapper>
      </div>
    </ProductProvider>
  );
};

export default LogisticsDemo;
