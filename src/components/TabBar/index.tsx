import { Button, Dropdown, Tabs, Tooltip } from "antd";
import {
  CloseCircleOutlined,
  CloseOutlined,
  MoreOutlined,
  ReloadOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
} from "@ant-design/icons";
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./style.module.less";
import { useTabStore } from "@/store/modules/tab";

const menuMap: Record<string, string> = {
  "/app/dashboard": "仪表盘",
  "/app/permission/roles": "角色管理",
  "/app/permission/resources": "资源管理",
  "/app/permission/users": "用户管理",
  "/app/category/category-types": "分类类型管理",
  "/app/category/categories": "分类管理",
};

const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    tabs,
    activeTab,
    removeTab,
    removeOtherTabs,
    removeLeftTabs,
    removeRightTabs,
    removeAllTabs,
  } = useTabStore();

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  const handleTabEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: "add" | "remove"
  ) => {
    if (action === "remove" && typeof targetKey === "string") {
      const tab = tabs.find((t) => t.key === targetKey);
      if (tab && tab.key !== "/app/dashboard") {
        removeTab(targetKey);
        // 如果关闭的是当前标签，导航到前一个标签
        if (targetKey === location.pathname) {
          const currentIndex = tabs.findIndex((t) => t.key === targetKey);
          if (currentIndex > 0) {
            navigate(tabs[currentIndex - 1].key);
          }
        }
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

  const items = tabs.map((tab) => ({
    key: tab.key,
    label: menuMap[tab.key] || "未知页面",
    closable: tab.key !== "/app/dashboard" && tabs.length > 1,
  }));

  return (
    <div className={styles.tabBar}>
      <Tabs
        hideAdd
        type="editable-card"
        activeKey={activeTab}
        onChange={handleTabChange}
        onEdit={handleTabEdit}
        items={items}
        tabBarExtraContent={operations}
      />
    </div>
  );
};

export default TabBar;
