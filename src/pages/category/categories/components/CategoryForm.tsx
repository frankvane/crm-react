import { Button, Form, Input, Space, message } from "antd";
import {
  createCategory,
  getCategory,
  updateCategory,
} from "@/api/modules/category";

import type { ICategoryType } from "@/types/api/category-type";
import type { ICreateCategoryParams } from "@/types/api/category";
import { getAllCategoryTypes } from "@/api/modules/category-type";
import { useQuery } from "@tanstack/react-query";

interface CategoryFormProps {
  id?: number;
  parentId?: number;
  typeId?: number;
  onSuccess?: () => void;
}

const CategoryForm = ({
  id,
  parentId,
  typeId,
  onSuccess,
}: CategoryFormProps) => {
  const [form] = Form.useForm<ICreateCategoryParams>();

  const { data: categoryData } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(Number(id)),
    enabled: !!id,
  });

  // 获取父级分类信息
  // 如果是编辑模式，使用 categoryData 中的 parentId
  // 如果是新增子分类模式，使用传入的 parentId
  const effectiveParentId = id ? categoryData?.parentId : parentId;

  const { data: parentCategory } = useQuery({
    queryKey: ["category", effectiveParentId],
    queryFn: () => getCategory(Number(effectiveParentId)),
    enabled: !!effectiveParentId,
  });

  const { data: categoryTypes } = useQuery<ICategoryType[]>({
    queryKey: ["categoryTypes"],
    queryFn: () => getAllCategoryTypes().then((response) => response.data),
  });

  const currentType = categoryTypes?.find((type) => type.id === typeId);

  const handleSubmit = async (values: ICreateCategoryParams) => {
    try {
      const submitData = {
        ...values,
        typeId: typeId as number,
        parentId: effectiveParentId || undefined,
      };

      if (id) {
        await updateCategory(id, submitData);
        message.success("更新成功");
      } else {
        await createCategory(submitData);
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
              sort: categoryData.sort,
            }
          : {
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

      <Form.Item label="分类类型">
        <Input value={currentType?.name} disabled />
      </Form.Item>

      <Form.Item label="父级分类">
        <Input
          value={parentCategory ? parentCategory.name : "无（顶级分类）"}
          disabled
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
