import {
  ApartmentOutlined,
  AppstoreOutlined,
  BarsOutlined,
  DashboardOutlined,
  FileTextOutlined,
  KeyOutlined,
  ProfileOutlined,
  ProjectOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  ShopOutlined,
  SolutionOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Form, Input, Modal, Select, message } from "antd";
import type {
  ICreateResourceParams,
  IResource,
  IUpdateResourceParams,
} from "@/types/api/resource";
import {
  createResource,
  getResource,
  updateResource,
} from "@/api/modules/resource";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { ResourceType } from "@/types/api/resource";

// 定义常用的图标列表
const ICON_OPTIONS = [
  { label: "仪表盘", value: "DashboardOutlined", icon: <DashboardOutlined /> },
  { label: "应用", value: "AppstoreOutlined", icon: <AppstoreOutlined /> },
  { label: "用户", value: "UserOutlined", icon: <UserOutlined /> },
  { label: "团队", value: "TeamOutlined", icon: <TeamOutlined /> },
  { label: "设置", value: "SettingOutlined", icon: <SettingOutlined /> },
  {
    label: "安全",
    value: "SecurityScanOutlined",
    icon: <SecurityScanOutlined />,
  },
  { label: "权限", value: "KeyOutlined", icon: <KeyOutlined /> },
  { label: "组织", value: "ApartmentOutlined", icon: <ApartmentOutlined /> },
  { label: "列表", value: "BarsOutlined", icon: <BarsOutlined /> },
  { label: "文档", value: "FileTextOutlined", icon: <FileTextOutlined /> },
  { label: "商品", value: "ShopOutlined", icon: <ShopOutlined /> },
  { label: "标签", value: "TagsOutlined", icon: <TagsOutlined /> },
  { label: "档案", value: "ProfileOutlined", icon: <ProfileOutlined /> },
  { label: "项目", value: "ProjectOutlined", icon: <ProjectOutlined /> },
  { label: "方案", value: "SolutionOutlined", icon: <SolutionOutlined /> },
  { label: "工具", value: "ToolOutlined", icon: <ToolOutlined /> },
];

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
  const [parentId, setParentId] = useState<number | null>(null);

  // 获取父级菜单信息
  const { data: parentResource } = useQuery({
    queryKey: ["resource", parentId],
    queryFn: () => (parentId ? getResource(parentId) : null),
    enabled: !!parentId,
  });

  // 创建资源
  const createMutation = useMutation({
    mutationFn: (data: ICreateResourceParams) =>
      createResource({
        ...data,
        type: ResourceType.MENU,
      }),
    onSuccess: () => {
      message.success("创建成功");
      form.resetFields(); // 重置表单
      onSuccess();
    },
  });

  // 更新资源
  const updateMutation = useMutation({
    mutationFn: (params: { id: number; data: IUpdateResourceParams }) =>
      updateResource(params.id, {
        ...params.data,
        type: ResourceType.MENU,
      }),
    onSuccess: () => {
      message.success("更新成功");
      form.resetFields(); // 重置表单
      onSuccess();
    },
  });

  // 监听表单可见性变化
  useEffect(() => {
    if (visible) {
      if (editingResource) {
        form.setFieldsValue(editingResource);
        if (typeof editingResource.parentId === "number") {
          setParentId(editingResource.parentId);
        }
      } else {
        form.resetFields();
        setParentId(null);
      }
    }
  }, [visible, editingResource, form]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingResource?.id) {
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

  // 处理取消
  const handleCancel = () => {
    form.resetFields(); // 重置表单
    onCancel();
  };

  return (
    <Modal
      title={editingResource ? "编辑菜单" : "新增菜单"}
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
    >
      <Form<ICreateResourceParams> form={form} layout="vertical">
        <Form.Item
          name="name"
          label="菜单名称"
          rules={[{ required: true, message: "请输入菜单名称" }]}
        >
          <Input placeholder="请输入菜单名称" />
        </Form.Item>

        <Form.Item
          name="code"
          label="菜单编码"
          rules={[{ required: true, message: "请输入菜单编码" }]}
        >
          <Input placeholder="请输入菜单编码" />
        </Form.Item>

        <Form.Item
          name="path"
          label="路由路径"
          rules={[{ required: true, message: "请输入路由路径" }]}
        >
          <Input placeholder="请输入路由路径" />
        </Form.Item>

        <Form.Item
          name="icon"
          label="图标"
          rules={[{ required: true, message: "请选择图标" }]}
        >
          <Select
            placeholder="请选择图标"
            options={ICON_OPTIONS}
            optionLabelProp="label"
            optionRender={(option) => (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {option.data.icon}
                <span>{option.data.label}</span>
              </div>
            )}
          />
        </Form.Item>

        <Form.Item label="父级菜单">
          <Input value={parentResource?.name || "无"} disabled />
          <Form.Item name="parentId" hidden>
            <Input />
          </Form.Item>
        </Form.Item>

        <Form.Item name="sort" label="排序">
          <Input type="number" placeholder="请输入排序" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResourceForm;
