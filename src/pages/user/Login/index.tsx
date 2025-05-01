import { Button, Form, Input, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./style.module.less";
import { useAuthStore } from "@/store/modules/auth";
import { useState } from "react";

interface LoginParams {
  username: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginParams) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success("登录成功");
      // 如果有保存的来源路径，就跳转回去，否则跳转到仪表盘
      const from =
        (location.state as { from?: Location })?.from?.pathname ||
        "/app/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      message.error(
        "登录失败: " + (error instanceof Error ? error.message : "未知错误")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Form<LoginParams>
        name="login"
        onFinish={handleSubmit}
        size="large"
        autoComplete="off"
        initialValues={{
          username: "admin",
          password: "admin123",
        }}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="用户名"
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "请输入密码" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
