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
import { buildMenuMap, lazyLoad } from "@/router/dynamicRoutes";
import { useLocation, useNavigate } from "react-router-dom";

import { KeepAlive } from "keepalive-for-react";
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
  const tabsRef = useRef(tabs);

  // 动态生成 menuMap 和 path->componentPath 映射
  const menuMap = useMemo(() => buildMenuMap(resources || []), [resources]);
  const componentMap = useMemo(() => {
    const map: Record<string, string> = {};
    function walk(routes: any[], parentPath = "") {
      for (const item of routes) {
        if ((item.type || "").toLowerCase() === "menu") {
          const normalizedPath = item.path.startsWith("/")
            ? item.path
            : `/${item.path}`;
          const fullPath = parentPath
            ? `${parentPath}${normalizedPath}`.replace(/\/+/g, "/")
            : normalizedPath;
          if (item.component) {
            map[fullPath] = item.component;
          }
          if (item.children && item.children.length > 0) {
            walk(item.children, fullPath);
          }
        }
      }
    }
    walk(resources || []);
    return map;
  }, [resources]);

  // 订阅 tabs 变化
  useEffect(() => {
    const unsubscribe = useTabStore.subscribe((state) => {
      tabsRef.current = state.tabs;
    });
    return () => unsubscribe();
  }, []);

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

  // 路由变化时，始终同步activeTab和tab
  useEffect(() => {
    const currentPath = location.pathname.replace(/^\/app/, "");
    const normalizedPath = currentPath.startsWith("/")
      ? currentPath
      : `/${currentPath}`;
    const routeName = menuMap[normalizedPath];
    const componentPath = componentMap[normalizedPath];
    addTab({
      key: location.pathname,
      label: routeName || normalizedPath,
      componentPath: componentPath || "",
    });
  }, [location.pathname, addTab, menuMap, componentMap]);

  // 关闭标签页
  const onEdit = (targetKey: string, action: "add" | "remove") => {
    if (action === "remove" && targetKey !== "/app/dashboard") {
      // 关闭前先计算下一个要跳转的 tab
      const currentTabs = tabsRef.current;
      const idx = currentTabs.findIndex((tab) => tab.key === targetKey);
      let nextTabKey = "/app/dashboard";
      if (idx > -1) {
        if (idx > 0) {
          nextTabKey = currentTabs[idx - 1].key;
        } else if (currentTabs.length > 1) {
          nextTabKey = currentTabs[1].key;
        }
      }
      if (targetKey === activeTab) {
        // 先跳转再异步移除，避免副作用
        navigate(nextTabKey);
        setTimeout(() => removeTab(targetKey), 0);
      } else {
        removeTab(targetKey);
      }
    }
  };

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

  // 当前激活 tab
  const currentTab = tabs.find((tab: any) => tab.key === activeTab);

  return (
    <div className={styles.tabBar}>
      <Tabs
        hideAdd
        type="editable-card"
        activeKey={activeTab}
        onChange={onChange}
        onEdit={onEdit as any}
        items={tabs.map((tab: any) => ({
          key: tab.key,
          label: tab.label,
          closable: tab.closable !== false,
        }))}
        tabBarExtraContent={operations}
      />
      <div className={styles.tabContent}>
        {currentTab && currentTab.componentPath && (
          <KeepAlive activeCacheKey={activeTab}>
            {lazyLoad(currentTab.componentPath)}
          </KeepAlive>
        )}
      </div>
    </div>
  );
};

export default TabBar;
