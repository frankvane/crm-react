import { Button, Card, Tree } from "antd";

import type { DataNode } from "antd/es/tree";
import type { ICategoryTreeResponse } from "@/types/api/category";
import { getCategoryTree } from "@/api/modules/category";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Categories = () => {
  const navigate = useNavigate();

  const { data: categoryTreeResponse } = useQuery<ICategoryTreeResponse>({
    queryKey: ["categoryTree"],
    queryFn: () => getCategoryTree(0),
  });

  const treeData = useMemo(() => {
    const transformToDataNode = (
      categories: ICategoryTreeResponse
    ): DataNode[] => {
      return categories.map((category) => ({
        key: category.id,
        title: category.name,
        children: category.children
          ? transformToDataNode(category.children)
          : undefined,
      }));
    };

    return categoryTreeResponse
      ? transformToDataNode(categoryTreeResponse)
      : [];
  }, [categoryTreeResponse]);

  return (
    <Card
      title="分类列表"
      extra={
        <Button
          type="primary"
          onClick={() => navigate("/category/categories/create")}
        >
          新增分类
        </Button>
      }
    >
      <Tree
        treeData={treeData}
        defaultExpandAll
        showLine={{ showLeafIcon: false }}
        blockNode
      />
    </Card>
  );
};

export default Categories;
