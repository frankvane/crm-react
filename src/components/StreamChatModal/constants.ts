// 角色类型声明
export interface RoleOption {
  value: string;
  label: string;
  color: string;
}

export const roles: RoleOption[] = [
  { value: "前端开发", label: "前端开发", color: "blue" },
  { value: "后端开发", label: "后端开发", color: "green" },
  { value: "UI设计", label: "UI设计", color: "purple" },
  { value: "测试", label: "测试", color: "orange" },
  { value: "讲师", label: "讲师", color: "red" },
];
