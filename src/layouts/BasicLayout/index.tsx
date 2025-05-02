import { Button, Layout } from "antd";
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import styles from "./style.module.less";
import { useAuthStore } from "@/store/modules/auth";
import { useTabStore } from "@/store/modules/tab";

const { Header, Content } = Layout;

const menuMap: Record<string, string> = {
  "/dashboard": "仪表盘",
  "/permission/roles": "角色管理",
  "/permission/resources": "资源管理",
  "/permission/users": "用户管理",
  "/category/category-types": "分类类型管理",
  "/category/categories": "分类管理",
};

const BasicLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { addTab } = useTabStore();

  useEffect(() => {
    const { pathname } = location;
    addTab({
      key: pathname,
      label: menuMap[pathname] || "未知页面",
    });
  }, [location, addTab]);

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
