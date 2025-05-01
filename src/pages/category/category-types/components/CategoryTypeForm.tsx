import { Form, Input, Modal, message } from "antd";
import type {
  ICategoryType,
  ICreateCategoryTypeParams,
  IUpdateCategoryTypeParams,
} from "@/types/api/category-type";
import {
  createCategoryType,
  updateCategoryType,
} from "@/api/modules/category-type";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

interface ICategoryTypeFormProps {
  visible: boolean;
  editingCategoryType: ICategoryType | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const CategoryTypeForm: React.FC<ICategoryTypeFormProps> = ({
  visible,
  editingCategoryType,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  // 创建分类类型
  const createMutation = useMutation({
    mutationFn: (data: ICreateCategoryTypeParams) => createCategoryType(data),
    onSuccess: () => {
      message.success("创建成功");
      onSuccess();
    },
  });

  // 更新分类类型
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: IUpdateCategoryTypeParams;
    }) => updateCategoryType(id, data),
    onSuccess: () => {
      message.success("更新成功");
      onSuccess();
    },
  });

  // 监听表单可见性变化
  useEffect(() => {
    if (visible) {
      if (editingCategoryType) {
        form.setFieldsValue(editingCategoryType);
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingCategoryType, form]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategoryType) {
        updateMutation.mutate({
          id: editingCategoryType.id,
          data: values,
        });
      } else {
        createMutation.mutate(values);
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  return (
    <Modal
      title={editingCategoryType ? "编辑分类类型" : "新增分类类型"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
    >
      <Form form={form} layout="vertical">
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
      </Form>
    </Modal>
  );
};

export default CategoryTypeForm;
