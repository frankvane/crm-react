import { Button, Card, Modal, Space, Table, Tag, message } from "antd";
import {
  deleteCategoryType,
  getCategoryTypes,
  toggleCategoryTypeStatus,
} from "@/api/modules/category-type";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { ICategoryType } from "@/types/api/category-type";
import dayjs from "dayjs";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const CategoryTypes = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categoryTypesResponse } = useQuery({
    queryKey: ["categoryTypes"],
    queryFn: () => getCategoryTypes({ page: 1, pageSize: 100 }),
  });

  const categoryTypes = categoryTypesResponse?.list || [];

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteCategoryType(id);
        message.success("删除成功");
        queryClient.invalidateQueries({ queryKey: ["categoryTypes"] });
      } catch (err) {
        message.error("删除失败");
        console.error(err);
      }
    },
    [queryClient]
  );

  const handleToggleStatus = useCallback(
    async (id: number) => {
      try {
        await toggleCategoryTypeStatus(id);
        message.success("状态更新成功");
        queryClient.invalidateQueries({ queryKey: ["categoryTypes"] });
      } catch (err) {
        message.error("状态更新失败");
        console.error(err);
      }
    },
    [queryClient]
  );

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
        <Space>
          <Button
            type="link"
            onClick={() =>
              navigate(`/category/category-types/${record.id}/edit`)
            }
          >
            编辑
          </Button>
          <Button type="link" onClick={() => handleToggleStatus(record.id)}>
            {record.status === 1 ? "禁用" : "启用"}
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              Modal.confirm({
                title: "确认删除",
                content: "确定要删除该分类类型吗？",
                onOk: () => handleDelete(record.id),
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="分类类型管理"
      extra={
        <Button
          type="primary"
          onClick={() => navigate("/category/category-types/new")}
        >
          新增分类类型
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={categoryTypes}
        rowKey="id"
        pagination={false}
      />
    </Card>
  );
};

export default CategoryTypes;
