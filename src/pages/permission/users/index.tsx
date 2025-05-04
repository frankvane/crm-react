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
import type { IUser, IUserQueryParams } from "@/types/api/user";
import { deleteUser, getUsers, toggleUserStatus } from "@/api/modules/user";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import AssignRoles from "./components/AssignRoles";
import type { IUserListResponse } from "@/types/api/user";
import Permission from "@/components/Permission";
import UserForm from "./components/UserForm";
import styles from "./style.module.less";

const { confirm } = Modal;

const Users = () => {
  useEffect(() => {
    console.log("用户管理页面挂载");
    return () => {
      console.log("用户管理页面卸载");
    };
  }, []);

  const queryClient = useQueryClient();
  const [form] = Form.useForm<IUserQueryParams>();
  const [modalVisible, setModalVisible] = useState(false);
  const [assignRolesVisible, setAssignRolesVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValues, setSearchValues] = useState<Partial<IUserQueryParams>>(
    {}
  );

  // 获取用户列表
  const { data: usersData, isLoading } = useQuery<IUserListResponse>({
    queryKey: ["users", currentPage, pageSize, searchValues],
    queryFn: () =>
      getUsers({
        page: currentPage,
        pageSize,
        ...searchValues,
      }),
  });

  // 删除用户
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      message.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // 切换用户状态
  const toggleStatusMutation = useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: () => {
      message.success("状态更新成功");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // 处理删除用户
  const handleDelete = (id: number) => {
    confirm({
      title: "确认删除",
      content: "确定要删除这个用户吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  // 处理切换用户状态
  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // 表格列配置
  const columns = [
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "角色",
      dataIndex: "roles",
      key: "roles",
      render: (roles: IUser["roles"]) => (
        <Space size={[0, 8]} wrap>
          {roles.map((role) => (
            <Tag key={role.id} color="blue">
              {role.name}
            </Tag>
          ))}
          {roles.length === 0 && <span>-</span>}
        </Space>
      ),
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
      render: (_: unknown, record: IUser) => (
        <Space size="middle">
          <Permission permission="permission:users:edit">
            <Button
              type="link"
              onClick={() => {
                setEditingUser(record);
                setModalVisible(true);
              }}
            >
              编辑
            </Button>
          </Permission>
          <Permission permission="permission:users:assign">
            <Button
              type="link"
              onClick={() => {
                setEditingUser(record);
                setAssignRolesVisible(true);
              }}
            >
              分配角色
            </Button>
          </Permission>
          <Permission permission="permission:users:edit">
            <Button
              type="link"
              onClick={() => handleToggleStatus(record.id)}
              loading={toggleStatusMutation.isPending}
            >
              {record.status === 1 ? "禁用" : "启用"}
            </Button>
          </Permission>
          <Permission permission="permission:users:delete">
            <Button type="link" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
          </Permission>
        </Space>
      ),
    },
  ];

  // 处理搜索
  const handleSearch = (values: Partial<IUserQueryParams>) => {
    setSearchValues(values);
    setCurrentPage(1);
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setSearchValues({});
    setCurrentPage(1);
  };

  return (
    <div className={styles.container}>
      <Card>
        <Form<IUserQueryParams>
          form={form}
          layout="inline"
          className={styles.searchForm}
          onFinish={handleSearch}
        >
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" allowClear />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" allowClear />
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
          <Permission permission="permission:users:add">
            <Button
              type="primary"
              onClick={() => {
                setEditingUser(null);
                setModalVisible(true);
              }}
            >
              新增用户
            </Button>
          </Permission>
        </div>

        <Table
          columns={columns}
          dataSource={usersData?.list}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: usersData?.pagination?.total || 0,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <UserForm
        visible={modalVisible}
        editingUser={editingUser}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
        }}
        onSuccess={() => {
          setModalVisible(false);
          setEditingUser(null);
          queryClient.invalidateQueries({ queryKey: ["users"] });
        }}
      />

      <AssignRoles
        visible={assignRolesVisible}
        userId={editingUser?.id}
        currentRoles={editingUser?.roles?.map((role) => role.id)}
        onCancel={() => {
          setAssignRolesVisible(false);
          setEditingUser(null);
        }}
      />
    </div>
  );
};

export default Users;
