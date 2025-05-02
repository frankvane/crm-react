import { Form, Input, Modal, message } from "antd";
import {
  createCategoryType,
  updateCategoryType,
} from "@/api/modules/category-type";
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
      confirmLoading={mutation.isPending}
      destroyOnClose
    >
      <Form
        form={form}
        initialValues={editingCategoryType || {}}
        preserve={false}
      >
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
