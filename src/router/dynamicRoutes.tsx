import React, { lazy } from "react";

import type { RouteObject } from "react-router-dom";

// 动态 import 组件
const lazyLoad = (componentPath: string) => {
  // 约定 componentPath 如 "system/user/index" => "@/pages/system/user/index"
  return lazy(() => import(`@/pages/${componentPath}`));
};

// 递归生成 RouteObject
export function generateRoutes(routeTree: any[]): RouteObject[] {
  return routeTree.map((item) => {
    const route: RouteObject = {
      path: item.path,
      element:
        item.component === "Layout"
          ? React.createElement(React.Fragment)
          : React.createElement(lazyLoad(item.component)),
      children: item.children ? generateRoutes(item.children) : undefined,
      // 可加 meta、权限等
    };
    return route;
  });
}
