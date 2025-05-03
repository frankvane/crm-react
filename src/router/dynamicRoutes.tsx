import { Navigate, Outlet } from "react-router-dom";
import React, { lazy } from "react";

import type { RouteObject } from "react-router-dom";

// 预先收集所有页面组件
const modules = import.meta.glob("/src/**/*.tsx");

/**
 * 动态加载组件
 * @param componentPath 组件路径
 */
const lazyLoad = (componentPath: string) => {
  // 规范化组件路径，确保正确加载
  const cleanPath = componentPath.replace(/^\//, "");
  let fullPath = `/src/${cleanPath}`;
  if (!fullPath.endsWith(".tsx")) {
    fullPath += "/index.tsx";
  }

  const loader = modules[fullPath];
  if (!loader) throw new Error(`页面未找到: ${fullPath}`);

  const Component = lazy(loader as any);
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Component />
    </React.Suspense>
  );
};

/**
 * 递归处理路由树，支持任意层级的嵌套
 * @param routes 路由数据
 */
const processRoutes = (routes: any[]): RouteObject[] => {
  return routes
    .filter((item) => {
      // 使用大小写不敏感的匹配来判断是否为菜单类型
      const type = (item.type || "").toLowerCase();
      return type === "menu";
    })
    .map((item) => {
      // 处理当前路由
      const { path, component, children } = item;

      // 规范化路径
      const normalizedPath = path.startsWith("/") ? path.substring(1) : path;

      // 递归处理子路由
      const childRoutes = children?.length > 0 ? processRoutes(children) : [];

      // 添加默认重定向（如果有子路由）
      const redirect =
        childRoutes.length > 0
          ? [
              {
                path: "",
                element: <Navigate to={childRoutes[0].path} replace />,
              },
            ]
          : [];

      // 确定要渲染的元素
      let element;

      if (component) {
        // 使用大小写不敏感的匹配来判断是否为布局组件
        const componentLower = component.toLowerCase();
        if (
          componentLower.includes("basiclayout") ||
          componentLower.includes("layout")
        ) {
          element = <Outlet />;
        } else {
          // 否则加载实际组件
          element = lazyLoad(component);
        }
      } else if (childRoutes.length > 0) {
        // 如果没有组件但有子路由，使用 Outlet
        element = <Outlet />;
      } else {
        // 既没有组件也没有子路由，返回 null（这种情况不应该出现）
        element = null;
      }

      // 创建路由对象
      return {
        path: normalizedPath,
        element,
        children:
          childRoutes.length > 0 ? [...redirect, ...childRoutes] : undefined,
      };
    })
    .filter(Boolean); // 过滤掉无效路由
};

/**
 * 根据后台返回的路由资源生成React Router路由配置
 * @param routeTree 后台返回的路由资源树
 */
export function generateRoutes(routeTree: any[]): RouteObject[] {
  return processRoutes(routeTree);
}

/**
 * 递归生成 path 到菜单名的映射表
 * @param routes 路由数据
 * @param parentPath 父级路径
 */
export function buildMenuMap(
  routes: any[],
  parentPath = ""
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of routes) {
    if ((item.type || "").toLowerCase() === "menu") {
      // 规范化路径，确保与路由对象中的路径格式一致
      const normalizedPath = item.path.startsWith("/")
        ? item.path
        : `/${item.path}`;
      const fullPath = parentPath
        ? `${parentPath}${normalizedPath}`.replace(/\/+/g, "/")
        : normalizedPath;

      // 使用路由对象中的 name 字段
      map[fullPath] = item.name || item.label || fullPath;

      if (item.children && item.children.length > 0) {
        Object.assign(map, buildMenuMap(item.children, fullPath));
      }
    }
  }
  return map;
}
