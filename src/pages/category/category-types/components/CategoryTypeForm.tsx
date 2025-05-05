import { Form, Input, Modal, message } from "antd";
import {
  createCategoryType,
  getCategoryType,
  updateCategoryType,
} from "@/api/modules/category-type";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ICategoryType } from "@/types/api/category-type";

interface CategoryTypeFormProps {
  visible: boolean;
  editingCategoryType: ICategoryType | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const CategoryTypeForm = ({
  visible,
  editingCategoryType,
  onCancel,
  onSuccess,
}: CategoryTypeFormProps) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // 编辑时实时请求数据回显
  useEffect(() => {
    const fetchData = async () => {
      if (visible && editingCategoryType) {
        setLoading(true);
        try {
          const data = await getCategoryType(editingCategoryType.id);
          form.setFieldsValue(data);
        } catch {
          message.error("获取最新数据失败，请重试");
        } finally {
          setLoading(false);
        }
      } else if (visible) {
        form.resetFields();
      }
    };
    fetchData();
  }, [visible, editingCategoryType, form]);

  // 创建或更新分类类型
  const mutation = useMutation({
    mutationFn: (values: Partial<ICategoryType>) =>
      editingCategoryType
        ? updateCategoryType(editingCategoryType.id, values)
        : createCategoryType(values),
    onSuccess: () => {
      message.success(`${editingCategoryType ? "更新" : "创建"}分类类型成功`);
      queryClient.invalidateQueries({ queryKey: ["categoryTypes"] });
      onSuccess();
    },
  });

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
      title={`${editingCategoryType ? "编辑" : "新增"}分类类型`}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={mutation.isPending || loading}
      destroyOnClose
    >
      <Form form={form} preserve={false} labelCol={{ span: 6 }}>
        <Form.Item
          name="name"
          label="类型名称"
          rules={[{ required: true, message: "请输入类型名称" }]}
        >
          <Input placeholder="请输入类型名称" />
        </Form.Item>
        <Form.Item
          name="code"
          label="类型编码"
          rules={[{ required: true, message: "请输入类型编码" }]}
        >
          <Input placeholder="请输入类型编码" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="请输入描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryTypeForm;
