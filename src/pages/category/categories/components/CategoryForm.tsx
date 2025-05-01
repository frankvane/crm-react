import { Form, Input, InputNumber, Modal, Select, message } from "antd";
import type {
  ICategory,
  ICategoryTreeNode,
  ICreateCategoryParams,
  IUpdateCategoryParams,
} from "@/types/api/category";
import {
  createCategory,
  getCategoryTree,
  updateCategory,
} from "@/api/modules/category";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { getCategories } from "@/api/modules/category";
import { getCategoryTypes } from "@/api/modules/category-type";

interface ICategoryFormProps {
  visible: boolean;
  editingCategory: ICategory | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const CategoryForm: React.FC<ICategoryFormProps> = ({
  visible,
  editingCategory,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm<ICreateCategoryParams>();
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  // 获取分类类型列表
  const { data: categoryTypesData } = useQuery({
    queryKey: ["categoryTypes", { page: 1, pageSize: 100 }],
    queryFn: () => getCategoryTypes({ page: 1, pageSize: 100 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", { page: 1, pageSize: 100 }],
    queryFn: () => getCategories({ page: 1, pageSize: 100 }),
  });

  const categoryTypeOptions = useMemo(() => {
    return (
      categoryTypesData?.list?.map((type) => ({
        label: type.name,
        value: type.id,
      })) || []
    );
  }, [categoryTypesData]);

  const parentCategoryOptions = useMemo(() => {
    return (
      categoriesData?.list?.map((category) => ({
        label: category.name,
        value: category.id,
      })) || []
    );
  }, [categoriesData]);

  // 获取分类树
  const { data: categoryTreeData } = useQuery({
    queryKey: ["categoryTree", selectedTypeId],
    queryFn: () => getCategoryTree(selectedTypeId!),
    enabled: !!selectedTypeId,
  });

  // 创建分类
  const createMutation = useMutation({
    mutationFn: (data: ICreateCategoryParams) => createCategory(data),
    onSuccess: () => {
      message.success("创建成功");
      onSuccess();
    },
  });

  // 更新分类
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: IUpdateCategoryParams }) =>
      updateCategory(id, data),
    onSuccess: () => {
      message.success("更新成功");
      onSuccess();
    },
  });

  // 监听表单可见性变化
  useEffect(() => {
    if (visible) {
      if (editingCategory) {
        form.setFieldsValue(editingCategory);
        setSelectedTypeId(editingCategory.typeId);
      } else {
        form.resetFields();
        setSelectedTypeId(null);
      }
    }
  }, [visible, editingCategory, form]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        updateMutation.mutate({
          id: editingCategory.id,
          data: values,
        });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      // 表单验证失败
      console.error("Validate Failed:", error);
    }
  };

  // 递归构建树形选项
  interface TreeOption {
    label: string;
    value: number;
    children?: TreeOption[];
  }

  const buildTreeOptions = (nodes: ICategoryTreeNode[] = []): TreeOption[] => {
    return nodes.map((node) => ({
      label: node.name,
      value: node.id,
      children: node.children ? buildTreeOptions(node.children) : undefined,
    }));
  };

  return (
    <Modal
      title={editingCategory ? "编辑分类" : "新增分类"}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
    >
      <Form<ICreateCategoryParams>
        form={form}
        layout="vertical"
        initialValues={{ status: 1 }}
      >
        <Form.Item
          name="name"
          label="分类名称"
          rules={[{ required: true, message: "请输入分类名称" }]}
        >
          <Input placeholder="请输入分类名称" />
        </Form.Item>

        <Form.Item
          name="code"
          label="分类编码"
          rules={[{ required: true, message: "请输入分类编码" }]}
        >
          <Input placeholder="请输入分类编码" />
        </Form.Item>

        <Form.Item
          name="typeId"
          label="分类类型"
          rules={[{ required: true, message: "请选择分类类型" }]}
        >
          <Select
            placeholder="请选择分类类型"
            options={categoryTypeOptions}
            onChange={(value) => setSelectedTypeId(value)}
          />
        </Form.Item>

        <Form.Item name="parentId" label="父级分类">
          <Select
            placeholder="请选择父级分类"
            allowClear
            options={buildTreeOptions(categoryTreeData?.data)}
            disabled={!selectedTypeId}
          />
        </Form.Item>

        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="请输入描述" />
        </Form.Item>

        <Form.Item name="sort" label="排序">
          <InputNumber placeholder="请输入排序" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: "请选择状态" }]}
        >
          <Select
            placeholder="请选择状态"
            options={[
              { label: "启用", value: 1 },
              { label: "禁用", value: 0 },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryForm;
