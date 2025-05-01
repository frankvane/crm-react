import { Button, Form, Input, Select, Space, message } from "antd";
import {
  createCategory,
  getCategory,
  updateCategory,
} from "@/api/modules/category";

import type { ICategoryType } from "@/types/api/category-type";
import type { ICreateCategoryParams } from "@/types/api/category";
import { getCategoryTypes } from "@/api/modules/category-type";
import { useQuery } from "@tanstack/react-query";

interface CategoryFormProps {
  id?: number;
  parentId?: number;
  onSuccess?: () => void;
}

const CategoryForm = ({ id, parentId, onSuccess }: CategoryFormProps) => {
  const [form] = Form.useForm<ICreateCategoryParams>();

  const { data: categoryData } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(Number(id)),
    enabled: !!id,
  });

  const { data: categoryTypesResponse } = useQuery({
    queryKey: ["categoryTypes"],
    queryFn: () => getCategoryTypes({ page: 1, pageSize: 100 }),
  });

  const categoryTypes = categoryTypesResponse?.list || [];

  const handleSubmit = async (values: ICreateCategoryParams) => {
    try {
      if (id) {
        await updateCategory(id, values);
        message.success("更新成功");
      } else {
        await createCategory(values);
        message.success("创建成功");
      }
      onSuccess?.();
    } catch (err) {
      message.error(id ? "更新失败" : "创建失败");
      console.error(err);
    }
  };

  return (
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
              parentId: categoryData.parentId,
              typeId: categoryData.typeId,
              sort: categoryData.sort,
            }
          : {
              parentId: parentId ?? null,
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
          options={[{ label: "无", value: null }]}
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

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {id ? "更新" : "创建"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CategoryForm;
