import ProductCard from "@/components/ProductCard";
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
    <>
      {/* ProductCardWrapper 常规用法示例（只用 props，不传 children） */}
      <ProductProvider>
        <div style={{ display: "flex", gap: 24 }}>
          <ProductCardWrapper
            layout="horizontal"
            productId="p1"
            imageSrc="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80"
            badgeType="premium"
            title="时尚运动鞋"
            price={"¥99.00"}
            onAddToCart={handleAddToCart}
            onWishlistChange={handleWishlistChange}
          />
          <ProductCardWrapper
            productId="p2"
            imageSrc="https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80"
            badgeType="default"
            title="现代风格椅子"
            price={"¥199.00"}
            onAddToCart={handleAddToCart}
            onWishlistChange={handleWishlistChange}
          />
          {/* 自定义操作按钮示例（只用 props） */}
          <ProductCardWrapper
            productId="p4"
            imageSrc="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
            badgeType="premium"
            title="自定义操作商品"
            price={"¥299.00"}
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
          {/* 完全自定义结构示例（只用 children，不传 imageSrc/badgeType/title/price 等 props） */}
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

      {/* ProductCard Section 插槽与 renderActions 扩展用法演示 */}
      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>
          ProductCard Section 插槽与 renderActions 扩展演示
        </h2>
        <ProductProvider>
          <div
            style={{
              display: "flex",
              gap: 32,
              padding: 32,
              background: "#f7f8fa",
            }}
          >
            {/* Section 插槽用法示例 */}
            <ProductCard productId="1001">
              <ProductCard.Image src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80" />
              <ProductCard.Badge type="premium">甄选</ProductCard.Badge>
              <ProductCard.Title>旗舰运动鞋</ProductCard.Title>
              <ProductCard.Section name="desc">
                <div style={{ color: "#888", fontSize: 13 }}>
                  超轻透气，适合夏季运动，舒适耐穿，心动价格，快来抢购！
                </div>
              </ProductCard.Section>
              <ProductCard.Section name="shop">
                <span
                  style={{
                    color: "#0a0",
                    fontWeight: 500,
                    paddingTop: 5,
                    paddingBottom: 5,
                    display: "block",
                  }}
                >
                  官方旗舰店
                </span>
              </ProductCard.Section>
              <ProductCard.Section name="promotion">
                <span style={{ color: "red", fontWeight: 500 }}>满200减20</span>
              </ProductCard.Section>
              <ProductCard.Price>￥299.00</ProductCard.Price>
            </ProductCard>

            {/* renderActions 扩展用法示例 */}
            <ProductCard
              productId="1002"
              renderActions={({
                isAddedToCart,
                isWishlisted,
                toggleCart,
                toggleWishlist,
              }) => (
                <>
                  <ProductCard.ActionButton
                    onClick={toggleCart}
                    isActive={isAddedToCart}
                  >
                    {isAddedToCart ? "移出购物车" : "加入购物车"}
                  </ProductCard.ActionButton>
                  <ProductCard.ActionButton
                    onClick={toggleWishlist}
                    isActive={isWishlisted}
                  >
                    {isWishlisted ? "移出心愿单" : "加入心愿单"}
                  </ProductCard.ActionButton>
                  <ProductCard.ActionButton onClick={() => alert("立即购买")}>
                    立即购买
                  </ProductCard.ActionButton>
                  <ProductCard.ActionButton onClick={() => alert("分享")}>
                    分享
                  </ProductCard.ActionButton>
                </>
              )}
            >
              <ProductCard.Image src="https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80" />
              <ProductCard.Badge type="default">热卖</ProductCard.Badge>
              <ProductCard.Title>现代风格椅子</ProductCard.Title>
              <ProductCard.Section name="desc">
                <div style={{ color: "#888", fontSize: 13, margin: 5 }}>
                  北欧设计，简约时尚，适合多种家居风格。
                </div>
              </ProductCard.Section>
              <ProductCard.Price>￥199.00</ProductCard.Price>
            </ProductCard>
          </div>
        </ProductProvider>
      </div>
    </>
  );
};

export default LogisticsDemo;
