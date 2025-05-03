import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { IRole, IRoleQueryParams } from "@/types/api/role";
import { deleteRole, getRoles, toggleRoleStatus } from "@/api/modules/role";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Permission from "@/components/Permission";
import RoleForm from "./components/RoleForm";
import RoleResourceModal from "./components/RoleResourceModal";
import styles from "./style.module.less";
import { useState } from "react";

const { confirm } = Modal;

const Roles = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<IRoleQueryParams>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<IRole | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValues, setSearchValues] = useState<Partial<IRoleQueryParams>>(
    {}
  );
  const [resourceModal, setResourceModal] = useState<{
    visible: boolean;
    roleId?: number;
  }>({ visible: false });

  // 获取角色列表
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles", currentPage, pageSize, searchValues],
    queryFn: () =>
      getRoles({
        page: currentPage,
        pageSize,
        ...searchValues,
      }),
  });

  // 删除角色
  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      message.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  // 切换角色状态
  const toggleStatusMutation = useMutation({
    mutationFn: toggleRoleStatus,
    onSuccess: () => {
      message.success("状态更新成功");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  // 处理删除角色
  const handleDelete = (id: number) => {
    confirm({
      title: "确认删除",
      content: "确定要删除这个角色吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  // 处理切换角色状态
  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // 表格列配置
  const columns = [
    {
      title: "角色名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "角色编码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: number) => (
        <Tag color={status === 1 ? "success" : "error"}>
          {status === 1 ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: IRole) => (
        <Space size="middle">
          <Permission permission="permission:roles:edit">
            <Button
              type="link"
              onClick={() => {
                setEditingRole(record);
                setModalVisible(true);
              }}
            >
              编辑
            </Button>
          </Permission>
          <Permission permission="permission:roles:edit">
            <Button type="link" onClick={() => handleToggleStatus(record.id)}>
              {record.status === 1 ? "禁用" : "启用"}
            </Button>
          </Permission>
          <Permission permission="permission:roles:delete">
            <Button type="link" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
          </Permission>
          <Permission permission="permission:roles:assign">
            <Button
              type="link"
              onClick={() =>
                setResourceModal({ visible: true, roleId: record.id })
              }
            >
              分配资源
            </Button>
          </Permission>
        </Space>
      ),
    },
  ];

  // 处理搜索
  const handleSearch = (values: Partial<IRoleQueryParams>) => {
    setCurrentPage(1);
    setSearchValues(values);
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setCurrentPage(1);
    setSearchValues({});
  };

  return (
    <div className={styles.container}>
      <Card>
        <Form<IRoleQueryParams>
          form={form}
          layout="inline"
          className={styles.searchForm}
          onFinish={handleSearch}
        >
          <Form.Item name="name" label="角色名称">
            <Input placeholder="请输入角色名称" allowClear />
          </Form.Item>
          <Form.Item name="code" label="角色编码">
            <Input placeholder="请输入角色编码" allowClear />
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
          <Permission permission="permission:roles:add">
            <Button
              type="primary"
              onClick={() => {
                setEditingRole(null);
                setModalVisible(true);
              }}
            >
              新增角色
            </Button>
          </Permission>
        </div>

        <Table
          columns={columns}
          dataSource={rolesData?.list}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: rolesData?.pagination?.total || 0,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <RoleForm
        visible={modalVisible}
        editingRole={editingRole}
        onCancel={() => {
          setModalVisible(false);
          setEditingRole(null);
        }}
        onSuccess={() => {
          setModalVisible(false);
          setEditingRole(null);
          queryClient.invalidateQueries({ queryKey: ["roles"] });
        }}
      />

      <RoleResourceModal
        visible={resourceModal.visible}
        roleId={resourceModal.roleId}
        onCancel={() => setResourceModal({ visible: false })}
        onSuccess={() => {
          setResourceModal({ visible: false });
          // 可选：刷新角色列表或资源分配信息
        }}
      />
    </div>
  );
};

export default Roles;
