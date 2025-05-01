import { Button, Card, Form, Input, Select, message } from "antd";
import {
  createCategory,
  getCategory,
  updateCategory,
} from "@/api/modules/category";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { ICategoryType } from "@/types/api/category-type";
import type { ICreateCategoryParams } from "@/types/api/category";
import { getCategoryTypes } from "@/api/modules/category-type";

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ICreateCategoryParams>();

  const { data: categoryResponse } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(Number(id)),
    enabled: !!id,
  });

  const { data: categoryTypesResponse } = useQuery({
    queryKey: ["categoryTypes"],
    queryFn: () => getCategoryTypes({ page: 1, pageSize: 100 }),
  });

  const categoryData = categoryResponse?.data;
  const categoryTypes = categoryTypesResponse?.list || [];

  const handleSubmit = async (values: ICreateCategoryParams) => {
    try {
      if (id) {
        await updateCategory(Number(id), values);
        message.success("更新成功");
      } else {
        await createCategory(values);
        message.success("创建成功");
      }
      queryClient.invalidateQueries({ queryKey: ["categoryTree"] });
      navigate("/category/categories");
    } catch (err) {
      message.error(id ? "更新失败" : "创建失败");
      console.error(err);
    }
  };

  return (
    <Card title={id ? "编辑分类" : "新增分类"}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={
          id && categoryData
            ? {
                name: categoryData.name,
                code: categoryData.code,
                description: categoryData.description,
                status: categoryData.status,
                parentId: categoryData.parentId,
                typeId: categoryData.typeId,
                sort: categoryData.sort,
              }
            : {
                status: 1,
                parentId: 0,
                sort: 0,
              }
        }
      >
        <Form.Item
          label="分类名称"
          name="name"
          rules={[{ required: true, message: "请输入分类名称" }]}
        >
          <Input placeholder="请输入分类名称" />
        </Form.Item>

        <Form.Item
          label="分类编码"
          name="code"
          rules={[{ required: true, message: "请输入分类编码" }]}
        >
          <Input placeholder="请输入分类编码" />
        </Form.Item>

        <Form.Item
          label="分类类型"
          name="typeId"
          rules={[{ required: true, message: "请选择分类类型" }]}
        >
          <Select
            options={categoryTypes.map((type: ICategoryType) => ({
              label: type.name,
              value: type.id,
            }))}
            placeholder="请选择分类类型"
          />
        </Form.Item>

        <Form.Item label="父级分类" name="parentId">
          <Select
            options={[{ label: "无", value: 0 }]}
            placeholder="请选择父级分类"
          />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input.TextArea placeholder="请输入描述" />
        </Form.Item>

        <Form.Item
          label="排序"
          name="sort"
          rules={[{ required: true, message: "请输入排序" }]}
        >
          <Input type="number" placeholder="请输入排序" />
        </Form.Item>

        <Form.Item
          label="状态"
          name="status"
          rules={[{ required: true, message: "请选择状态" }]}
        >
          <Select
            options={[
              { label: "启用", value: 1 },
              { label: "禁用", value: 0 },
            ]}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {id ? "更新" : "创建"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CategoryForm;
