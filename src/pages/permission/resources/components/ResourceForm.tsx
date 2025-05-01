import { Form, Input, InputNumber, Modal, Select, message } from "antd";
import type {
  ICreateResourceParams,
  IResource,
  IUpdateResourceParams,
} from "@/types/api/resource";
import { createResource, updateResource } from "@/api/modules/resource";

import { ResourceType } from "@/types/api/resource";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

interface IResourceFormProps {
  visible: boolean;
  editingResource: IResource | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ResourceForm: React.FC<IResourceFormProps> = ({
  visible,
  editingResource,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm<ICreateResourceParams>();

  // 创建资源
  const createMutation = useMutation({
    mutationFn: (data: ICreateResourceParams) => createResource(data),
    onSuccess: () => {
      message.success("创建成功");
      onSuccess();
    },
  });

  // 更新资源
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: IUpdateResourceParams }) =>
      updateResource(id, data),
    onSuccess: () => {
      message.success("更新成功");
      onSuccess();
    },
  });

  // 监听表单可见性变化
  useEffect(() => {
    if (visible) {
      if (editingResource) {
        form.setFieldsValue(editingResource);
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingResource, form]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingResource) {
        updateMutation.mutate({
          id: editingResource.id,
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

  return (
    <Modal
      title={editingResource ? "编辑资源" : "新增资源"}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
    >
      <Form<ICreateResourceParams>
        form={form}
        layout="vertical"
        initialValues={{ status: 1 }}
      >
        <Form.Item
          name="name"
          label="资源名称"
          rules={[{ required: true, message: "请输入资源名称" }]}
        >
          <Input placeholder="请输入资源名称" />
        </Form.Item>

        <Form.Item
          name="code"
          label="资源编码"
          rules={[{ required: true, message: "请输入资源编码" }]}
        >
          <Input placeholder="请输入资源编码" />
        </Form.Item>

        <Form.Item
          name="type"
          label="资源类型"
          rules={[{ required: true, message: "请选择资源类型" }]}
        >
          <Select
            placeholder="请选择资源类型"
            options={[
              { label: "菜单", value: ResourceType.MENU },
              { label: "按钮", value: ResourceType.BUTTON },
              { label: "接口", value: ResourceType.API },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="path"
          label="资源路径"
          rules={[{ required: true, message: "请输入资源路径" }]}
        >
          <Input placeholder="请输入资源路径" />
        </Form.Item>

        <Form.Item
          name="method"
          label="请求方法"
          rules={[
            {
              validator: async (_, value) => {
                if (form.getFieldValue("type") === ResourceType.API && !value) {
                  throw new Error("请选择请求方法");
                }
              },
            },
          ]}
        >
          <Select
            placeholder="请选择请求方法"
            options={[
              { label: "GET", value: "GET" },
              { label: "POST", value: "POST" },
              { label: "PUT", value: "PUT" },
              { label: "DELETE", value: "DELETE" },
            ]}
          />
        </Form.Item>

        <Form.Item name="icon" label="图标">
          <Input placeholder="请输入图标" />
        </Form.Item>

        <Form.Item name="parentId" label="父级资源">
          <InputNumber
            placeholder="请输入父级资源ID"
            style={{ width: "100%" }}
          />
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

export default ResourceForm;
