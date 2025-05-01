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
import type { IResource, IResourceQueryParams } from "@/types/api/resource";
import {
  deleteResource,
  getResources,
  toggleResourceStatus,
} from "@/api/modules/resource";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ResourceForm from "./components/ResourceForm";
import { ResourceType } from "@/types/api/resource";
import styles from "./style.module.less";
import { useState } from "react";

const { confirm } = Modal;

const Resources = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<IResourceQueryParams>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState<IResource | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValues, setSearchValues] = useState<
    Partial<IResourceQueryParams>
  >({});

  // 获取资源列表
  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ["resources", currentPage, pageSize, searchValues],
    queryFn: () =>
      getResources({
        page: currentPage,
        pageSize,
        ...searchValues,
      }),
  });

  // 删除资源
  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: () => {
      message.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });

  // 切换资源状态
  const toggleStatusMutation = useMutation({
    mutationFn: toggleResourceStatus,
    onSuccess: () => {
      message.success("状态更新成功");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
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

  // 表格列配置
  const columns = [
    {
      title: "资源名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "资源编码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "资源类型",
      dataIndex: "type",
      key: "type",
      render: (type: ResourceType) => {
        const typeMap = {
          [ResourceType.MENU]: { color: "blue", text: "菜单" },
          [ResourceType.BUTTON]: { color: "green", text: "按钮" },
          [ResourceType.API]: { color: "purple", text: "接口" },
        };
        return <Tag color={typeMap[type].color}>{typeMap[type].text}</Tag>;
      },
    },
    {
      title: "路径",
      dataIndex: "path",
      key: "path",
    },
    {
      title: "排序",
      dataIndex: "sort",
      key: "sort",
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
      render: (_: unknown, record: IResource) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              setEditingResource(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button type="link" onClick={() => handleToggleStatus(record.id)}>
            {record.status === 1 ? "禁用" : "启用"}
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处理搜索
  const handleSearch = (values: Partial<IResourceQueryParams>) => {
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
            onClick={() => {
              setEditingResource(null);
              setModalVisible(true);
            }}
          >
            新增资源
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={resourcesData?.data.list}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: resourcesData?.data.pagination?.total || 0,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
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
          queryClient.invalidateQueries({ queryKey: ["resources"] });
        }}
      />
    </div>
  );
};

export default Resources;
