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
import type { ICategory, ICategoryQueryParams } from "@/types/api/category";
import {
  deleteCategory,
  getCategories,
  toggleCategoryStatus,
} from "@/api/modules/category";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import CategoryForm from "./components/CategoryForm";
import type { ICategoryType } from "@/types/api/category-type";
import { getCategoryTypes } from "@/api/modules/category-type";
import styles from "./style.module.less";
import { useState } from "react";

const { confirm } = Modal;

const Categories = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ICategoryQueryParams>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValues, setSearchValues] = useState<
    Partial<ICategoryQueryParams>
  >({});

  // 获取分类列表
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["categories", currentPage, pageSize, searchValues],
    queryFn: () =>
      getCategories({
        page: currentPage,
        pageSize,
        ...searchValues,
      }),
  });

  // 获取分类类型列表
  const { data: categoryTypesData } = useQuery({
    queryKey: ["categoryTypes"],
    queryFn: () => getCategoryTypes({ page: 1, pageSize: 100 }),
  });

  // 删除分类
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      message.success("删除成功");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // 切换分类状态
  const toggleStatusMutation = useMutation({
    mutationFn: toggleCategoryStatus,
    onSuccess: () => {
      message.success("状态更新成功");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // 处理删除分类
  const handleDelete = (id: number) => {
    confirm({
      title: "确认删除",
      content: "确定要删除这个分类吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  // 处理切换分类状态
  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // 表格列配置
  const columns = [
    {
      title: "分类名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "分类编码",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "分类类型",
      dataIndex: ["type", "name"],
      key: "type",
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
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
      render: (_: unknown, record: ICategory) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              setEditingCategory(record);
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
  const handleSearch = (values: Partial<ICategoryQueryParams>) => {
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
        <Form<ICategoryQueryParams>
          form={form}
          layout="inline"
          className={styles.searchForm}
          onFinish={handleSearch}
        >
          <Form.Item name="name" label="分类名称">
            <Input placeholder="请输入分类名称" allowClear />
          </Form.Item>
          <Form.Item name="code" label="分类编码">
            <Input placeholder="请输入分类编码" allowClear />
          </Form.Item>
          <Form.Item name="typeId" label="分类类型">
            <Select
              placeholder="请选择分类类型"
              allowClear
              options={
                categoryTypesData?.list?.map((type: ICategoryType) => ({
                  label: type.name,
                  value: type.id,
                })) || []
              }
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
              setEditingCategory(null);
              setModalVisible(true);
            }}
          >
            新增分类
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categoriesData?.data?.list || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize,
            total: categoriesData?.data?.pagination?.total || 0,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <CategoryForm
        visible={modalVisible}
        editingCategory={editingCategory}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
        }}
        onSuccess={() => {
          setModalVisible(false);
          setEditingCategory(null);
          queryClient.invalidateQueries({ queryKey: ["categories"] });
        }}
      />
    </div>
  );
};

export default Categories;
