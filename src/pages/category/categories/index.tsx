import { Button, Card, Modal, Tree, message } from "antd";
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

  const { data: categoryTreeResponse } = useQuery<ICategoryTreeResponse>({
    queryKey: ["categoryTree"],
    queryFn: () => getCategoryTree(0),
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
      queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
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
      <Card
        title="分类列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setModal({
                visible: true,
                type: "add",
              });
            }}
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

      <Modal
        title={getModalTitle()}
        open={modal.visible}
        onCancel={() => setModal({ visible: false, type: "add" })}
        footer={null}
        destroyOnClose
        width={600}
      >
        <CategoryForm
          id={modal.type === "edit" ? modal.categoryId : undefined}
          parentId={modal.type === "addSub" ? modal.categoryId : undefined}
          onSuccess={() => {
            setModal({ visible: false, type: "add" });
            queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
          }}
        />
      </Modal>
    </>
  );
};

export default Categories;
