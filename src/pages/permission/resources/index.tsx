import {
  ApartmentOutlined,
  AppstoreOutlined,
  BarsOutlined,
  DashboardOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  KeyOutlined,
  PlusOutlined,
  ProfileOutlined,
  ProjectOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  ShopOutlined,
  SolutionOutlined,
  SubnodeOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Badge, Button, Card, Modal, Space, Tree, message } from "antd";
import type {
  IResource,
  IResourceTreeNode,
  IResourceTreeResponse,
} from "@/types/api/resource";
import { deleteResource, getResourceTree } from "@/api/modules/resource";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { DataNode } from "antd/es/tree";
import ResourceActionModal from "./components/ResourceActionModal";
import ResourceForm from "./components/ResourceForm";
import styles from "./style.module.less";

const { confirm } = Modal;

const IconMap = {
  AppstoreOutlined: <AppstoreOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  TeamOutlined: <TeamOutlined />,
  UserOutlined: <UserOutlined />,
  SettingOutlined: <SettingOutlined />,
  SecurityScanOutlined: <SecurityScanOutlined />,
  KeyOutlined: <KeyOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
  BarsOutlined: <BarsOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  ShopOutlined: <ShopOutlined />,
  TagsOutlined: <TagsOutlined />,
  ProfileOutlined: <ProfileOutlined />,
  ProjectOutlined: <ProjectOutlined />,
  SolutionOutlined: <SolutionOutlined />,
};

const Resources = () => {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<IResource | null>(
    null
  );
  const [currentResource, setCurrentResource] = useState<IResource | null>(
    null
  );

  // 获取资源树
  const { data: resourceTreeData = [] } = useQuery<IResourceTreeResponse>({
    queryKey: ["resourceTree"],
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

  // 处理删除资源
  const handleDelete = (id: number) => {
    confirm({
      title: "确认删除",
      content: "确定要删除这个菜单吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      onOk: () => deleteMutation.mutate(id),
    });
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
              {resource.icon && IconMap[resource.icon as keyof typeof IconMap]}
              <span>{resource.name}</span>
              {resource.actions && resource.actions.length > 0 && (
                <Badge
                  count={resource.actions.length}
                  style={{ marginLeft: 8 }}
                />
              )}
              {resource.path && (
                <span style={{ color: "#999" }}>({resource.path})</span>
              )}
            </Space>
            <Space>
              <Button
                type="text"
                icon={<SubnodeOutlined />}
                title="添加子菜单"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingResource({ parentId: resource.id } as IResource);
                  setModalVisible(true);
                }}
              />
              <Button
                type="text"
                icon={<ToolOutlined />}
                title="操作管理"
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
                title="编辑菜单"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingResource(resource);
                  setModalVisible(true);
                }}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                title="删除菜单"
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

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.tableHeader}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingResource(null);
              setModalVisible(true);
            }}
          >
            新增菜单
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
