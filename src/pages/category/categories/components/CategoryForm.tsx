import { Form, Input, Modal, Select, message } from "antd";
import {
  createCategory,
  getCategory,
  updateCategory,
} from "@/api/modules/category";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { ICategory } from "@/types/api/category";
import { getAllCategoryTypes } from "@/api/modules/category-type";

interface CategoryFormProps {
  visible: boolean;
  id?: number;
  parentId?: number;
  typeId?: number;
  onCancel: () => void;
  onSuccess: () => void;
}

const CategoryForm = ({
  visible,
  id,
  parentId,
  typeId,
  onCancel,
  onSuccess,
}: CategoryFormProps) => {
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState<Partial<ICategory>>({});

  // 获取分类类型列表
  const { data: categoryTypes = [] } = useQuery({
    queryKey: ["allCategoryTypes"],
    queryFn: getAllCategoryTypes,
  });

  // 获取分类详情
  const { data: categoryData } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id as number),
    enabled: !!id,
  });

  // 创建或更新分类
  const mutation = useMutation({
    mutationFn: (values: Partial<ICategory>) =>
      id ? updateCategory(id, values) : createCategory(values),
    onSuccess: () => {
      message.success(`${id ? "更新" : "创建"}分类成功`);
      onSuccess();
    },
  });

  // 设置初始值
  useEffect(() => {
    if (visible) {
      if (categoryData) {
        setInitialValues(categoryData);
      } else {
        setInitialValues({
          parentId,
          typeId,
        });
      }
    }
  }, [visible, categoryData, parentId, typeId]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      mutation.mutate(values);
    } catch (error) {
      console.error("验证失败:", error);
    }
  };

  return (
    <Modal
      title={`${id ? "编辑" : "新增"}分类`}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={mutation.isPending}
      destroyOnClose
    >
      <Form form={form} preserve={false}>
        <Form.Item
          name="name"
          label="分类名称"
          rules={[{ required: true, message: "请输入分类名称" }]}
        >
          <Input placeholder="请输入分类名称" />
        </Form.Item>
        <Form.Item
          name="typeId"
          label="分类类型"
          rules={[{ required: true, message: "请选择分类类型" }]}
        >
          <Select
            placeholder="请选择分类类型"
            options={categoryTypes.map((type) => ({
              label: type.name,
              value: type.id,
            }))}
            disabled={!!typeId}
          />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="请输入描述" />
        </Form.Item>
        <Form.Item name="parentId" hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryForm;
