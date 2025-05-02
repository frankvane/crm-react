import * as Icons from "@ant-design/icons";

import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

import { ReactNode } from "react";
import styles from "./style.module.less";
import { useAuthStore } from "@/store/modules/auth";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

// 动态获取 icon 组件
function getIconByName(name?: string): ReactNode {
  if (!name) return null;
  const IconComponent = (Icons as any)[name];
  return IconComponent ? <IconComponent /> : null;
}

function buildMenuItems(resources: any[], parentPath = "/app"): any[] {
  return (resources || [])
    .filter((item: any) => item.type.toLowerCase() === "menu")
    .map((item: any) => {
      const fullPath = item.path.startsWith("/")
        ? item.path
        : `${parentPath}/${item.path}`;
      const children = item.children
        ? buildMenuItems(item.children, fullPath)
        : undefined;
      return {
        key: fullPath,
        icon: getIconByName(item.icon),
        label: item.name,
        ...(children && children.length > 0 ? { children } : {}),
      };
    });
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const resources = useAuthStore((state) => state.resources);

  const menuItems = buildMenuItems(resources || []);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 展开所有父级菜单
  const getOpenKeys = (pathname: string) => {
    const parts = pathname.split("/").filter(Boolean);
    const keys: string[] = [];
    let current = "";
    for (const part of parts) {
      current += "/" + part;
      keys.push(current);
    }
    return keys;
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
        defaultOpenKeys={getOpenKeys(location.pathname)}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default Sidebar;
