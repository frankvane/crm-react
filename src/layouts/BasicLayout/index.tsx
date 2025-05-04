import { Button, Layout } from "antd";
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import React, { useState } from "react";

import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import styles from "./style.module.less";
import { useAuthStore } from "@/store/modules/auth";

const { Header, Content } = Layout;

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/user/login", { replace: true });
  };

  return (
    <Layout className={styles.layout}>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <Header className={styles.header}>
          <div className={styles.headerContent}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.trigger}
            />
            <div className={styles.userInfo}>
              <span className={styles.username}>Admin</span>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                退出登录
              </Button>
            </div>
          </div>
        </Header>
        <div className={styles.mainContent}>
          <TabBar />
          <Content className={styles.content}>
            <Outlet />
          </Content>
        </div>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
