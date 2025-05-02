import { Button, Card, Form, Input, Modal, Space, Table, message } from "antd";
import type {
  ICategoryType,
  ICategoryTypeQueryParams,
} from "@/types/api/category-type";
import {
  deleteCategoryType,
  getCategoryTypes,
} from "@/api/modules/category-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import CategoryTypeForm from "./components/CategoryTypeForm";
import type { ICategoryTypeListResponse } from "@/types/api/category-type";
import dayjs from "dayjs";
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
  const {
    data: categoryTypesData = { list: [], pagination: { total: 0 } },
    isLoading,
  } = useQuery<ICategoryTypeListResponse>({
    queryKey: ["categoryTypes", currentPage, pageSize, searchValues],
    queryFn: async () => {
      const response = await getCategoryTypes({
        page: currentPage,
        pageSize,
        ...searchValues,
      });
      if (!response) {
        throw new Error("Failed to fetch category types");
      }
      return response;
    },
  });

  // 删除分类类型
  const deleteMutation = useMutation({
    mutationFn: deleteCategoryType,
    onSuccess: () => {
      message.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["categoryTypes"] });
    },
  });

  // 处理删除
  const handleDelete = (id: number) => {
    confirm({
      title: "确认删除",
      content: "确定要删除这个分类类型吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  // 表格列配置
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "类型名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "类型编码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) =>
        dayjs(createdAt).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt: string) =>
        dayjs(updatedAt).format("YYYY-MM-DD HH:mm:ss"),
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
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 处理搜索
  const handleSearch = (values: Partial<ICategoryTypeQueryParams>) => {
    // 移除空值
    const searchParams = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        return { ...acc, [key]: value };
      }
      return acc;
    }, {});

    setSearchValues(searchParams);
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
        <Form<ICategoryTypeQueryParams>
          form={form}
          layout="inline"
          className={styles.searchForm}
          onFinish={handleSearch}
        >
          <Form.Item name="search" label="全局搜索">
            <Input placeholder="搜索全部字段" allowClear />
          </Form.Item>
          <Form.Item name="name" label="类型名称">
            <Input placeholder="请输入类型名称" allowClear />
          </Form.Item>
          <Form.Item name="code" label="类型编码">
            <Input placeholder="请输入类型编码" allowClear />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="请输入描述" allowClear />
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
