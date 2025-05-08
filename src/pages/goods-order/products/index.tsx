import React, { useCallback, useEffect, useRef } from "react";

import { FixedSizeList as List } from "react-window";
import ProductCardWrapper from "@/components/ProductCard/ProductCardWrapper";
import { ProductProvider } from "@/components/ProductCard/context/ProductContext";
import styles from "./style.module.less";
import { useInfiniteScroll } from "ahooks";

const PAGE_SIZE = 20;
const LIST_HEIGHT = 600;
const ITEM_SIZE = 160;

const fetchProducts = async (page: number) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (page > 15) return [];
  return Array.from({ length: PAGE_SIZE }).map((_, i) => ({
    id: `product-${page}-${i}`,
    title: `商品 ${page}-${i}`,
    imageSrc:
      "https://img13.360buyimg.com/n1/s720x720_jfs/t1/261011/19/4060/78338/676e6932F64cf6e0e/fc5d7a4011a6e23c.jpg.avif",
    price: `￥${(Math.random() * 1000).toFixed(2)}`,
  }));
};

const Index = () => {
  const outerRef = useRef<HTMLDivElement>(null);

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
      target.scrollHeight - target.scrollTop - target.clientHeight < ITEM_SIZE
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

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    if (!data || index === data.list.length) {
      // 最后一行：加载更多
      return (
        <div style={style}>
          {noMore ? "没有更多了" : loading ? "加载中..." : ""}
        </div>
      );
    }
    const item = data.list[index];
    return (
      <div style={style}>
        <ProductCardWrapper
          style={{ margin: 8, backgroundColor: "#fff" }}
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
  };

  return (
    <div>
      <ProductProvider>
        <List
          height={LIST_HEIGHT}
          itemCount={(data?.list.length || 0) + 1}
          itemSize={ITEM_SIZE}
          width={"100%"}
          outerRef={outerRef}
        >
          {Row}
        </List>
      </ProductProvider>
    </div>
  );
};

export default Index;
