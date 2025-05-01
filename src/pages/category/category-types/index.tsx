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
import type {
  ICategoryType,
  ICategoryTypeQueryParams,
} from "@/types/api/category-type";
import {
  deleteCategoryType,
  getCategoryTypes,
  toggleCategoryTypeStatus,
} from "@/api/modules/category-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import CategoryTypeForm from "./components/CategoryTypeForm";
import styles from "./style.module.less";
import { useState } from "react";

const { confirm } = Modal;

const CategoryTypes = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ICategoryTypeQueryParams>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategoryType, setEditingCategoryType] =
    useState<ICategoryType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValues, setSearchValues] = useState<
    Partial<ICategoryTypeQueryParams>
  >({});

  // 获取分类类型列表
  const { data: categoryTypesData, isLoading } = useQuery({
    queryKey: ["categoryTypes", currentPage, pageSize, searchValues],
    queryFn: () =>
      getCategoryTypes({
        page: currentPage,
        pageSize,
        ...searchValues,
      }),
  });

  // 删除分类类型
  const deleteMutation = useMutation({
    mutationFn: deleteCategoryType,
    onSuccess: () => {
      message.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["categoryTypes"] });
    },
  });

  // 切换分类类型状态
  const toggleStatusMutation = useMutation({
    mutationFn: toggleCategoryTypeStatus,
    onSuccess: () => {
      message.success("状态更新成功");
      queryClient.invalidateQueries({ queryKey: ["categoryTypes"] });
    },
  });

  // 处理删除分类类型
  const handleDelete = (id: number) => {
    confirm({
      title: "确认删除",
      content: "确定要删除这个分类类型吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  // 处理切换分类类型状态
  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // 表格列配置
  const columns = [
    {
      title: "分类类型名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "分类类型编码",
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
      render: (_: unknown, record: ICategoryType) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              setEditingCategoryType(record);
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
  const handleSearch = (values: Partial<ICategoryTypeQueryParams>) => {
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
        <Form<ICategoryTypeQueryParams>
          form={form}
          layout="inline"
          className={styles.searchForm}
          onFinish={handleSearch}
        >
          <Form.Item name="name" label="分类类型名称">
            <Input placeholder="请输入分类类型名称" allowClear />
          </Form.Item>
          <Form.Item name="code" label="分类类型编码">
            <Input placeholder="请输入分类类型编码" allowClear />
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
              setEditingCategoryType(null);
              setModalVisible(true);
            }}
          >
            新增分类类型
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categoryTypesData?.list}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: categoryTypesData?.pagination?.total || 0,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <CategoryTypeForm
        visible={modalVisible}
        editingCategoryType={editingCategoryType}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategoryType(null);
        }}
        onSuccess={() => {
          setModalVisible(false);
          setEditingCategoryType(null);
          queryClient.invalidateQueries({ queryKey: ["categoryTypes"] });
        }}
      />
    </div>
  );
};

export default CategoryTypes;
