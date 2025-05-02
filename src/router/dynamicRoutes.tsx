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
 * 根据后台返回的路由资源生成React Router路由配置
 * @param routeTree 后台返回的路由资源树
 */
export function generateRoutes(routeTree: any[]): RouteObject[] {
  // 过滤顶级路由
  return routeTree
    .filter((item) => item.type === "menu")
    .map((item) => {
      // 处理当前路由
      const { path, component, children } = item;

      // 规范化路径
      const normalizedPath = path.startsWith("/") ? path.substring(1) : path;

      // 处理子路由
      const childRoutes =
        children?.length > 0
          ? children
              .filter((child) => child.type === "menu")
              .map((child) => {
                // 规范化子路由路径
                const childPath = child.path.startsWith("/")
                  ? child.path.substring(1)
                  : child.path;

                // 创建子路由对象
                return {
                  path: childPath,
                  element: child.component ? lazyLoad(child.component) : null,
                  children: [], // 目前限制只处理二级嵌套
                };
              })
          : [];

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

      // 创建路由对象
      return {
        path: normalizedPath,
        element: component ? (
          component.endsWith("BasicLayout") ? (
            <Outlet />
          ) : (
            lazyLoad(component)
          )
        ) : (
          <Outlet />
        ),
        children: [...redirect, ...childRoutes],
      };
    });
}
