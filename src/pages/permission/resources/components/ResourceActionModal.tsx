import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Table,
  message,
} from "antd";
import type { IResource, IResourceAction } from "@/types/api/resource";
import {
  createResourceAction,
  deleteResourceAction,
  getResourceActions,
  updateResourceAction,
} from "@/api/modules/resource";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useState } from "react";

interface ResourceActionModalProps {
  visible: boolean;
  resource: IResource | null;
  onCancel: () => void;
}

const ResourceActionModal: React.FC<ResourceActionModalProps> = ({
  visible,
  resource,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [editingAction, setEditingAction] = useState<IResourceAction | null>(
    null
  );
  const queryClient = useQueryClient();

  // 获取资源操作列表
  const { data: actions = [] } = useQuery({
    queryKey: ["resourceActions", resource?.id],
    queryFn: () => getResourceActions(resource!.id),
    enabled: visible && !!resource,
  });

  console.log(actions);

  // 创建/更新资源操作
  const actionMutation = useMutation({
    mutationFn: (values: Partial<IResourceAction>) =>
      editingAction
        ? updateResourceAction(resource!.id, editingAction.id, values)
        : createResourceAction(resource!.id, values),
    onSuccess: () => {
      message.success(`${editingAction ? "更新" : "创建"}成功`);
      queryClient.invalidateQueries({
        queryKey: ["resourceActions", resource?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["resourceTree"] });
      form.resetFields();
      setEditingAction(null);
    },
  });

  // 删除资源操作
  const deleteMutation = useMutation({
    mutationFn: (actionId: number) =>
      deleteResourceAction(resource!.id, actionId),
    onSuccess: () => {
      message.success("删除成功");
      queryClient.invalidateQueries({
        queryKey: ["resourceActions", resource?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["resourceTree"] });
    },
  });

  const handleDelete = (actionId: number) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个资源操作吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      onOk: () => deleteMutation.mutate(actionId),
    });
  };

  const columns = [
    { title: "操作名称", dataIndex: "name", width: 150 },
    { title: "操作编码", dataIndex: "code", width: 150 },
    { title: "描述", dataIndex: "description", ellipsis: true },
    {
      title: "需要确认",
      dataIndex: "needConfirm",
      width: 100,
      render: (value: boolean) => (value ? "是" : "否"),
    },
    {
      title: "操作",
      width: 120,
      render: (_: unknown, record: IResourceAction) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingAction(record);
              form.setFieldsValue(record);
            }}
          >
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={`资源操作管理 - ${resource?.name || ""}`}
      open={visible}
      onCancel={() => {
        onCancel();
        form.resetFields();
        setEditingAction(null);
      }}
      width={800}
      footer={null}
    >
      <Form
        form={form}
        layout="inline"
        onFinish={(values) => actionMutation.mutate(values)}
        style={{ marginBottom: 16 }}
      >
        <Form.Item name="name" label="操作名称" rules={[{ required: true }]}>
          <Input placeholder="请输入操作名称" />
        </Form.Item>
        <Form.Item name="code" label="操作编码" rules={[{ required: true }]}>
          <Input placeholder="请输入操作编码" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input placeholder="请输入描述" />
        </Form.Item>
        <Form.Item name="needConfirm" label="需要确认" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item
          name="confirmMessage"
          label="确认信息"
          dependencies={["needConfirm"]}
          rules={[
            ({ getFieldValue }) => ({
              required: getFieldValue("needConfirm"),
              message: "启用确认时，确认信息为必填",
            }),
          ]}
        >
          <Input placeholder="请输入确认信息" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {editingAction ? "更新" : "添加"}
            </Button>
            {editingAction && (
              <Button
                onClick={() => {
                  form.resetFields();
                  setEditingAction(null);
                }}
              >
                取消
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={actions}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
};

export default ResourceActionModal;
