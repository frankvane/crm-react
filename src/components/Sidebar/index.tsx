import {
  AppstoreOutlined,
  DashboardOutlined,
  KeyOutlined,
  TagOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import type { MenuProps } from "antd";
import styles from "./style.module.less";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps["items"] = [
    {
      key: "/app/dashboard",
      icon: <DashboardOutlined />,
      label: "仪表盘",
    },
    {
      key: "permission",
      icon: <KeyOutlined />,
      label: "权限管理",
      children: [
        {
          key: "/app/permission/roles",
          icon: <AppstoreOutlined />,
          label: "角色管理",
        },
        {
          key: "/app/permission/resources",
          icon: <UnorderedListOutlined />,
          label: "资源管理",
        },
        {
          key: "/app/permission/users",
          icon: <UserOutlined />,
          label: "用户管理",
        },
      ],
    },
    {
      key: "category",
      icon: <TagOutlined />,
      label: "分类管理",
      children: [
        {
          key: "/app/category/category-types",
          icon: <AppstoreOutlined />,
          label: "分类类型管理",
        },
        {
          key: "/app/category/categories",
          icon: <UnorderedListOutlined />,
          label: "分类管理",
        },
      ],
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      className={styles.sidebar}
      width={200}
      collapsed={collapsed}
      collapsible
      trigger={null}
    >
      <div className={styles.logo}>
        <h1>{collapsed ? "CRM" : "CRM Admin"}</h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={["permission", "category"]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default Sidebar;
