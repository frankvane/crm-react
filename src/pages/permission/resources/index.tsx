import {
  Badge,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Tree,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SubnodeOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import type {
  IResource,
  IResourceQueryParams,
  IResourceTreeNode,
  IResourceTreeResponse,
} from "@/types/api/resource";
import {
  deleteResource,
  getResourceTree,
  toggleResourceStatus,
} from "@/api/modules/resource";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { DataNode } from "antd/es/tree";
import ResourceActionModal from "./components/ResourceActionModal";
import ResourceForm from "./components/ResourceForm";
import { ResourceType } from "@/types/api/resource";
import styles from "./style.module.less";

const { confirm } = Modal;

const Resources = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<IResourceQueryParams>();
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<IResource | null>(
    null
  );
  const [currentResource, setCurrentResource] = useState<IResource | null>(
    null
  );
  const [searchValues, setSearchValues] = useState<
    Partial<IResourceQueryParams>
  >({});

  // 获取资源树
  const { data: resourceTreeData = [] } = useQuery<IResourceTreeResponse>({
    queryKey: ["resourceTree", searchValues],
    queryFn: getResourceTree,
  });

  // 删除资源
  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: () => {
      message.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["resourceTree"] });
    },
  });

  // 切换资源状态
  const toggleStatusMutation = useMutation({
    mutationFn: toggleResourceStatus,
    onSuccess: () => {
      message.success("状态更新成功");
      queryClient.invalidateQueries({ queryKey: ["resourceTree"] });
    },
  });

  // 处理删除资源
  const handleDelete = (id: number) => {
    confirm({
      title: "确认删除",
      content: "确定要删除这个资源吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  // 处理切换资源状态
  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // 转换资源数据为树形结构
  const treeData = useMemo(() => {
    const transformToTreeNode = (
      resources: IResourceTreeNode[]
    ): DataNode[] => {
      return resources.map((resource) => ({
        key: resource.id,
        title: (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Space>
              <span>{resource.name}</span>
              {resource.actions && resource.actions.length > 0 && (
                <Badge
                  count={resource.actions.length}
                  style={{ marginLeft: 8 }}
                />
              )}
              <Tag
                color={
                  resource.type === ResourceType.MENU
                    ? "blue"
                    : resource.type === ResourceType.BUTTON
                    ? "green"
                    : "purple"
                }
              >
                {resource.type === ResourceType.MENU
                  ? "菜单"
                  : resource.type === ResourceType.BUTTON
                  ? "按钮"
                  : "接口"}
              </Tag>
              <Tag color={resource.status === 1 ? "success" : "error"}>
                {resource.status === 1 ? "启用" : "禁用"}
              </Tag>
              {resource.path && <span>({resource.path})</span>}
            </Space>
            <Space>
              <Button
                type="text"
                icon={<SubnodeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingResource({ parentId: resource.id } as IResource);
                  setModalVisible(true);
                }}
              />
              <Button
                type="text"
                icon={<ToolOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setActionModalVisible(true);
                  setCurrentResource(resource);
                }}
              >
                操作管理
              </Button>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingResource(resource);
                  setModalVisible(true);
                }}
              />
              <Button
                type="text"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus(resource.id);
                }}
              >
                {resource.status === 1 ? "禁用" : "启用"}
              </Button>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(resource.id);
                }}
              />
            </Space>
          </div>
        ),
        children: resource.children
          ? transformToTreeNode(resource.children)
          : undefined,
      }));
    };

    return transformToTreeNode(resourceTreeData);
  }, [resourceTreeData]);

  // 处理搜索
  const handleSearch = (values: Partial<IResourceQueryParams>) => {
    setSearchValues(values);
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setSearchValues({});
  };

  return (
    <div className={styles.container}>
      <Card>
        <Form<IResourceQueryParams>
          form={form}
          layout="inline"
          className={styles.searchForm}
          onFinish={handleSearch}
        >
          <Form.Item name="name" label="资源名称">
            <Input placeholder="请输入资源名称" allowClear />
          </Form.Item>
          <Form.Item name="code" label="资源编码">
            <Input placeholder="请输入资源编码" allowClear />
          </Form.Item>
          <Form.Item name="type" label="资源类型">
            <Select
              placeholder="请选择资源类型"
              allowClear
              options={[
                { label: "菜单", value: ResourceType.MENU },
                { label: "按钮", value: ResourceType.BUTTON },
                { label: "接口", value: ResourceType.API },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="请选择状态"
              allowClear
              options={[
                { label: "启用", value: 1 },
                { label: "禁用", value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        <div className={styles.tableHeader}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingResource(null);
              setModalVisible(true);
            }}
          >
            新增资源
          </Button>
        </div>

        <Tree
          treeData={treeData}
          defaultExpandAll
          showLine={{ showLeafIcon: false }}
          blockNode
        />
      </Card>

      <ResourceForm
        visible={modalVisible}
        editingResource={editingResource}
        onCancel={() => {
          setModalVisible(false);
          setEditingResource(null);
        }}
        onSuccess={() => {
          setModalVisible(false);
          setEditingResource(null);
          queryClient.invalidateQueries({ queryKey: ["resourceTree"] });
        }}
      />

      <ResourceActionModal
        visible={actionModalVisible}
        resource={currentResource}
        onCancel={() => {
          setActionModalVisible(false);
          setCurrentResource(null);
        }}
      />
    </div>
  );
};

export default Resources;
