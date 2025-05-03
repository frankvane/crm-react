import { Button, Dropdown, Tabs, Tooltip } from "antd";
import {
  CloseCircleOutlined,
  CloseOutlined,
  MoreOutlined,
  ReloadOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
} from "@ant-design/icons";
import React, { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { buildMenuMap } from "@/router/dynamicRoutes";
import styles from "./style.module.less";
import { useAuthStore } from "@/store/modules/auth";
import { useTabStore } from "@/store/modules/tab";

const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    tabs,
    activeTab,
    addTab,
    removeTab,
    removeOtherTabs,
    removeLeftTabs,
    removeRightTabs,
    removeAllTabs,
  } = useTabStore();
  const resources = useAuthStore((state) => state.resources);
  const user = useAuthStore((state) => state.user);
  const prevUserId = useRef(user?.id);

  // 动态生成 menuMap
  const menuMap = useMemo(() => buildMenuMap(resources || []), [resources]);

  // 用户切换时自动重置TabBar，只保留dashboard
  useEffect(() => {
    if (user?.id !== prevUserId.current) {
      removeAllTabs();
      prevUserId.current = user?.id;
    }
  }, [user?.id, removeAllTabs]);

  // TabBar标签页切换
  const onChange = (key: string) => {
    navigate(key);
  };

  // 关闭标签页
  const onEdit = (targetKey: string, action: "add" | "remove") => {
    if (action === "remove") {
      removeTab(targetKey);
      // 如果关闭的是当前标签，跳转到dashboard
      if (targetKey === activeTab) {
        navigate("/app/dashboard");
      }
    }
  };

  // 自动添加当前路由到TabBar
  useEffect(() => {
    // 移除 /app 前缀
    const currentPath = location.pathname.replace(/^\/app/, "");
    // 确保路径格式正确
    const normalizedPath = currentPath.startsWith("/")
      ? currentPath
      : `/${currentPath}`;

    if (!tabs.find((tab) => tab.key === location.pathname)) {
      const routeName = menuMap[normalizedPath];
      addTab({
        key: location.pathname, // 保持原始路径（带 /app 前缀）作为 key
        label: routeName || normalizedPath,
      });
    }
  }, [location.pathname, addTab, tabs, menuMap]);

  const refreshPage = () => {
    window.location.reload();
  };

  const moreItems = useMemo(
    () => [
      {
        key: "closeOthers",
        label: "关闭其他",
        icon: <CloseCircleOutlined />,
        onClick: () => removeOtherTabs(location.pathname),
      },
      {
        key: "closeLeft",
        label: "关闭左侧",
        icon: <VerticalRightOutlined />,
        onClick: () => removeLeftTabs(location.pathname),
      },
      {
        key: "closeRight",
        label: "关闭右侧",
        icon: <VerticalLeftOutlined />,
        onClick: () => removeRightTabs(location.pathname),
      },
      {
        key: "closeAll",
        label: "关闭全部",
        icon: <CloseOutlined />,
        onClick: () => {
          removeAllTabs();
          navigate("/app/dashboard");
        },
      },
    ],
    [
      location.pathname,
      removeOtherTabs,
      removeLeftTabs,
      removeRightTabs,
      removeAllTabs,
      navigate,
    ]
  );

  const operations = {
    right: (
      <div className={styles.operations}>
        <Tooltip title="刷新当前页">
          <Button type="text" icon={<ReloadOutlined />} onClick={refreshPage} />
        </Tooltip>
        <Dropdown menu={{ items: moreItems }} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      </div>
    ),
  };

  return (
    <div className={styles.tabBar}>
      <Tabs
        hideAdd
        type="editable-card"
        activeKey={activeTab}
        onChange={onChange}
        onEdit={onEdit as any}
        items={tabs.map((tab) => ({
          key: tab.key,
          label: menuMap[tab.key.replace(/^\/app/, "")] || tab.label || tab.key,
        }))}
        tabBarExtraContent={operations}
      />
    </div>
  );
};

export default TabBar;
