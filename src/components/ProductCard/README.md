# ProductCard 组件开发文档

> 适用范围：商品卡片、商品列表、详情页等场景，支持图片、标题、价格、徽章、操作按钮等复合结构，支持灵活插槽与自定义。
>
> **如需查看实际效果，请参考 src/pages/goods-order/logistics/ProductCardDemo.tsx 示例页面。**

## 组件结构

- **ProductCard** 主组件（支持插槽/复合结构）
  - `ProductCard.Image` 商品图片
  - `ProductCard.Title` 商品标题
  - `ProductCard.Price` 商品价格
  - `ProductCard.Badge` 商品徽章
  - `ProductCard.ActionButton` 操作按钮
  - `ProductCard.Section` 通用分区插槽（支持 name 属性，语义化分区，内容完全自定义）
- **withProductCard** 高阶组件（HOC），用于快速集成商品卡片包装和通用逻辑

---

## withProductCard 高阶组件用法

`withProductCard` 是一个高阶组件（HOC），用于快速为自定义内容组件提供商品卡片包装、状态和操作能力。

### 快速用法

```tsx
import { withProductCard } from "@/components/ProductCard/withProductCard";

// 默认内容组件（可选）
const DefaultContent = ({ children }) => (children ? <>{children}</> : null);

// 包裹后得到 ProductCardWrapper
const ProductCardWrapper = withProductCard(DefaultContent);

// 只用 props（推荐）
<ProductCardWrapper
  productId="1002"
  imageSrc="xxx.jpg"
  title="商品标题"
  price={<span>￥88.00</span>}
  badgeType="premium"
  onAddToCart={(id, added) => console.log(id, added)}
  onWishlistChange={(id, wish) => console.log(id, wish)}
/>

// 只用 children（完全自定义结构）
<ProductCardWrapper productId="p3" onAddToCart={...} onWishlistChange={...}>
  <ProductCard.Image src="..." alt="..." />
  <ProductCard.Badge type="premium">限量</ProductCard.Badge>
  <ProductCard.Title>定制插槽商品</ProductCard.Title>
  <ProductCard.Price>¥299.00</ProductCard.Price>
  <div>自定义底部内容</div>
</ProductCardWrapper>
```

- props 和 children 不要混用同一内容，否则会重复渲染。
- 有 imageSrc、badgeType、title、price 等 props 时，优先渲染 props，忽略 children。
- 原 ProductCardWrapper 组件已废弃，统一使用 HOC 方式。

---

## ProductCard Props

| 属性名        | 类型                       | 说明                       | 必填 | 默认值   |
| ------------- | -------------------------- | -------------------------- | ---- | -------- |
| productId     | string                     | 商品唯一标识               | 是   | -        |
| children      | ReactNode                  | 子组件内容（推荐使用插槽） | 是   | -        |
| customFooter  | ReactNode                  | 自定义底部内容             | 否   | -        |
| renderActions | (params) => ReactNode      | 自定义操作按钮渲染函数     | 否   | -        |
| layout        | "vertical" \| "horizontal" | 布局方向                   | 否   | vertical |
| className     | string                     | 自定义 className           | 否   | -        |
| style         | CSSProperties              | 自定义样式                 | 否   | -        |

### 插槽/复合结构用法

- 推荐通过`ProductCard.Image`、`ProductCard.Title`、`ProductCard.Price`、`ProductCard.Badge`等子组件组合，实现灵活布局。
- 操作按钮可通过`renderActions`自定义，或使用`ProductCard.ActionButton`。
- **支持通过 `ProductCard.Section` 语义化分区插槽，name 可自定义（如 desc/shop/promotion/自定义），内容完全自定义。**
- Section 插槽可用于商品简介、店铺、促销等任意内容插入，组件内部会自动识别 Section 并按 name 分类渲染，未识别的 Section 统一渲染到 details 区域。
- 保留 children 兜底，支持完全自定义结构。

#### 典型用法示例

```tsx
<ProductCard
  productId="1001"
  layout="vertical"
  renderActions={({
    isAddedToCart,
    isWishlisted,
    toggleCart,
    toggleWishlist,
  }) => (
    <>
      <ProductCard.ActionButton onClick={toggleCart} isActive={isAddedToCart}>
        {isAddedToCart ? "移出购物车" : "加入购物车"}
      </ProductCard.ActionButton>
      <ProductCard.ActionButton
        onClick={toggleWishlist}
        isActive={isWishlisted}
      >
        {isWishlisted ? "移出心愿单" : "加入心愿单"}
      </ProductCard.ActionButton>
    </>
  )}
>
  <ProductCard.Image src="xxx.jpg" alt="商品图" />
  <ProductCard.Badge type="premium">甄选</ProductCard.Badge>
  <ProductCard.Title>商品标题</ProductCard.Title>
  <ProductCard.Section name="desc">
    <div style={{ color: "#888" }}>商品简介内容</div>
  </ProductCard.Section>
  <ProductCard.Section name="shop">
    <span style={{ color: "#0a0" }}>旗舰店</span>
  </ProductCard.Section>
  <ProductCard.Section name="promotion">
    <span style={{ color: "red" }}>满200减20</span>
  </ProductCard.Section>
  <ProductCard.Price>￥99.00</ProductCard.Price>
</ProductCard>
```

---

## renderActions 扩展用法

- renderActions 参数已扩展为 ProductCardActionContext，包含 isAddedToCart、isWishlisted、toggleCart、toggleWishlist、productId、children、productData、extra 等上下文。
- 支持任意自定义按钮和交互。

```tsx
<ProductCard
  productId="1001"
  renderActions={({
    isAddedToCart,
    isWishlisted,
    toggleCart,
    toggleWishlist,
    productId,
    children,
    productData,
    extra,
  }) => (
    <>
      <ProductCard.ActionButton onClick={toggleCart} isActive={isAddedToCart}>
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
      {/* 还可以渲染更多自定义按钮 */}
    </>
  )}
>
  {/* ...插槽内容 */}
</ProductCard>
```

---

## ProductCard Section 插槽与 renderActions 扩展用法

### 1. Section 插槽用法（完全自定义分区）

```tsx
<ProductCard productId="1001">
  <ProductCard.Image src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80" />
  <ProductCard.Badge type="premium">甄选</ProductCard.Badge>
  <ProductCard.Title>旗舰运动鞋</ProductCard.Title>
  <ProductCard.Section name="desc">
    <div style={{ color: "#888", fontSize: 13 }}>
      超轻透气，适合夏季运动，舒适耐穿。
    </div>
  </ProductCard.Section>
  <ProductCard.Section name="shop">
    <span style={{ color: "#0a0", fontWeight: 500 }}>官方旗舰店</span>
  </ProductCard.Section>
  <ProductCard.Section name="promotion">
    <span style={{ color: "red", fontWeight: 500 }}>满200减20</span>
  </ProductCard.Section>
  <ProductCard.Price>￥299.00</ProductCard.Price>
</ProductCard>
```

### 2. renderActions 扩展用法（自定义操作区）

```tsx
<ProductCard
  productId="1002"
  renderActions={({
    isAddedToCart,
    isWishlisted,
    toggleCart,
    toggleWishlist,
  }) => (
    <>
      <ProductCard.ActionButton onClick={toggleCart} isActive={isAddedToCart}>
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
    <div style={{ color: "#888", fontSize: 13 }}>
      北欧设计，简约时尚，适合多种家居风格。
    </div>
  </ProductCard.Section>
  <ProductCard.Price>￥199.00</ProductCard.Price>
</ProductCard>
```

---

## props 与插槽优先级说明

- withProductCard HOC：有 imageSrc、badgeType、title、price 等 props 时，**只渲染 props 内容，忽略 children**。
- ProductCard：完全自定义结构，children 里的内容只渲染一次，支持 Section 分区。
- 推荐：标准场景用 withProductCard（props），复杂/自定义场景用 ProductCard（children/插槽）。

---

如需更多用法示例或遇到问题，请联系组件维护者。
