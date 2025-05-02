import { Button, Card, Modal, Tabs, Tree, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SubnodeOutlined,
} from "@ant-design/icons";
import { deleteCategory, getCategoryTree } from "@/api/modules/category";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import CategoryForm from "./components/CategoryForm";
import type { DataNode } from "antd/es/tree";
import type { ICategoryTreeResponse } from "@/types/api/category";
import type { ICategoryType } from "@/types/api/category-type";
import { getAllCategoryTypes } from "@/api/modules/category-type";

interface ModalState {
  visible: boolean;
  type: "add" | "edit" | "addSub";
  categoryId?: number;
}

const Categories = () => {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ModalState>({
    visible: false,
    type: "add",
  });
  const [activeTypeId, setActiveTypeId] = useState<number>();

  // 获取所有分类类型
  const { data: categoryTypes = [] } = useQuery<ICategoryType[]>({
    queryKey: ["categoryTypes"],
    queryFn: async () => {
      const response = await getAllCategoryTypes();
      if (!response) {
        throw new Error("Failed to fetch category types");
      }
      return response;
    },
  });

  // 设置默认选中的分类类型
  useMemo(() => {
    if (categoryTypes && categoryTypes.length && !activeTypeId) {
      setActiveTypeId(categoryTypes[0].id);
    }
  }, [categoryTypes, activeTypeId]);

  // 获取指定类型的分类树
  const { data: categoryTreeResponse = [] } = useQuery<ICategoryTreeResponse>({
    queryKey: ["categoryTree", activeTypeId],
    queryFn: async () => {
      const response = await getCategoryTree(activeTypeId as number);
      if (!response) {
        throw new Error("Failed to fetch category tree");
      }
      return response;
    },
    enabled: !!activeTypeId,
  });

  const treeData = useMemo(() => {
    const transformToDataNode = (
      categories: ICategoryTreeResponse[number][]
    ): DataNode[] => {
      return categories.map((category) => ({
        key: category.id,
        title: (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <span>{category.name}</span>
            <span>
              <Button
                type="text"
                icon={<SubnodeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setModal({
                    visible: true,
                    type: "addSub",
                    categoryId: category.id,
                  });
                }}
              />
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setModal({
                    visible: true,
                    type: "edit",
                    categoryId: category.id,
                  });
                }}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  Modal.confirm({
                    title: "确认删除",
                    content: "确定要删除该分类吗？",
                    onOk: () => handleDelete(category.id),
                  });
                }}
              />
            </span>
          </div>
        ),
        children: category.children
          ? transformToDataNode(category.children)
          : undefined,
      }));
    };

    return categoryTreeResponse
      ? transformToDataNode(categoryTreeResponse)
      : [];
  }, [categoryTreeResponse]);

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      message.success("删除成功");
      queryClient.invalidateQueries({
        queryKey: ["categoryTree", activeTypeId],
      });
    } catch (err) {
      message.error("删除失败");
      console.error(err);
    }
  };

  const getModalTitle = () => {
    switch (modal.type) {
      case "add":
        return "新增分类";
      case "edit":
        return "编辑分类";
      case "addSub":
        return "新增子分类";
      default:
        return "";
    }
  };

  return (
    <>
      <Card title="分类列表">
        <Tabs
          activeKey={activeTypeId?.toString()}
          onChange={(key) => setActiveTypeId(Number(key))}
          tabBarExtraContent={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setModal({
                  visible: true,
                  type: "add",
                });
              }}
              disabled={!activeTypeId}
            >
              新增分类
            </Button>
          }
          items={
            categoryTypes?.map((type) => ({
              key: type.id.toString(),
              label: type.name,
              children: (
                <Tree
                  treeData={treeData}
                  defaultExpandAll
                  showLine={{ showLeafIcon: false }}
                  blockNode
                />
              ),
            })) || []
          }
        />
      </Card>

      <Modal
        title={getModalTitle()}
        open={modal.visible}
        onCancel={() => setModal({ visible: false, type: "add" })}
        footer={null}
        destroyOnClose
        width={600}
      >
        <CategoryForm
          visible={modal.visible}
          id={modal.type === "edit" ? modal.categoryId : undefined}
          parentId={modal.type === "addSub" ? modal.categoryId : undefined}
          typeId={activeTypeId}
          onCancel={() => setModal({ visible: false, type: "add" })}
          onSuccess={() => {
            setModal({ visible: false, type: "add" });
            queryClient.invalidateQueries({
              queryKey: ["categoryTree", activeTypeId],
            });
          }}
        />
      </Modal>
    </>
  );
};

export default Categories;
