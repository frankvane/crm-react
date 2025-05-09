import React, { useCallback, useEffect, useRef } from "react";

// 导入React库中的函数
import { FixedSizeList as List } from "react-window";
// 导入react-window库中的FixedSizeList组件
import ProductCardWrapper from "@/components/ProductCard/ProductCardWrapper";
// 导入自定义的ProductCardWrapper组件
import { ProductProvider } from "@/components/ProductCard/context/ProductContext";
import { Skeleton } from "antd";
import styles from "./style.module.less";
import { useInfiniteScroll } from "ahooks";

const PAGE_SIZE = 20;
const LIST_HEIGHT = 600;
const ITEM_SIZE = 160;
const PRELOAD_OFFSET = ITEM_SIZE * 15; // 距离底部4行时预加载

// 模拟异步获取商品数据
const unsplashImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600",
  "https://images.unsplash.com/photo-1465101178521-c1a9136a3b41?w=600",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=600",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600",
];

const fetchProducts = async (page: number) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (page > 15) return [];
  return Array.from({ length: PAGE_SIZE }).map((_, i) => ({
    id: `product-${page}-${i}`,
    title: `商品 ${page}-${i}`,
    imageSrc: unsplashImages[(page * PAGE_SIZE + i) % unsplashImages.length],
    price: `￥${(Math.random() * 1000).toFixed(2)}`,
  }));
};

const Row = React.memo(
  ({
    index,
    style,
    data,
    loading,
    noMore,
  }: {
    index: number;
    style: React.CSSProperties;
    data: any;
    loading: boolean;
    noMore: boolean;
  }) => {
    if (!data || (!noMore && index === data.list.length)) {
      // 最后一行：加载更多
      return (
        <div style={style}>
          {noMore ? "没有更多了" : loading ? "加载中..." : ""}
        </div>
      );
    }
    const item = data.list[index];
    if (!item) {
      // 数据未加载到，渲染 antd Skeleton 骨架屏
      return (
        <div style={style}>
          <Skeleton
            active
            paragraph={false}
            title={false}
            style={{ height: ITEM_SIZE - 16, borderRadius: 8 }}
          />
        </div>
      );
    }
    return (
      <div style={style}>
        <ProductCardWrapper
          productId={item.id}
          layout="horizontal"
          imageSrc={item.imageSrc}
          title={`${item.title}（索引：${index}）`}
          price={item.price}
          showActions={true}
          customFooter={
            <div className={styles.customFooter}>自定义内容，索引：{index}</div>
          }
        />
      </div>
    );
  }
);

const Index = () => {
  const outerRef = useRef<HTMLDivElement>(null);

  // 使用ahooks库中的useInfiniteScroll函数实现无限滚动
  const { data, loading, loadMore, noMore } = useInfiniteScroll(
    async (d) => {
      const nextPage = d ? Math.floor(d.list.length / PAGE_SIZE) + 1 : 1;
      const list = d ? d.list : [];
      const newList = await fetchProducts(nextPage);
      return {
        list: [...list, ...newList],
      };
    },
    {
      manual: true,
      isNoMore: (d) => !!d && d.list.length >= 300, // 最多15页
    }
  );

  // 初始时主动加载一页
  useEffect(() => {
    if (!data) loadMore();
  }, [data, loadMore]);

  // 滚动到底部时手动触发 loadMore
  const handleScroll = useCallback(() => {
    const target = outerRef.current;
    if (
      target &&
      !loading &&
      !noMore &&
      target.scrollHeight - target.scrollTop - target.clientHeight <
        PRELOAD_OFFSET
    ) {
      loadMore();
    }
  }, [loading, noMore, loadMore]);

  useEffect(() => {
    const target = outerRef.current;
    if (!target) return;
    target.addEventListener("scroll", handleScroll);
    return () => {
      target.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div>
      <ProductProvider>
        <List
          height={LIST_HEIGHT}
          itemCount={
            noMore ? data?.list.length || 0 : (data?.list.length || 0) + 1
          }
          itemSize={ITEM_SIZE}
          width={"100%"}
          outerRef={outerRef}
          overscanCount={100}
        >
          {({ index, style }) => (
            <Row
              index={index}
              style={style}
              data={data}
              loading={loading}
              noMore={noMore}
            />
          )}
        </List>
      </ProductProvider>
    </div>
  );
};

export default Index;
