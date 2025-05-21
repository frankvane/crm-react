import { Navigate, useRoutes } from "react-router-dom";
import { Suspense, useMemo } from "react";

// 导入路由守卫组件
import AuthGuard from "@/components/AuthGuard";
// 导入基础布局组件
import BasicLayout from "@/layouts/BasicLayout";
// 导入 Ant Design 的 Spin 组件用于加载状态显示
import { Spin } from "antd";
// 导入任意路由配置
import anyRoutes from "@/router/anyRoutes";
// 导入动态路由生成函数
import { generateRoutes } from "@/router/dynamicRoutes";
// 导入静态路由配置
import staticRoutes from "@/router/staticRoutes";
// 导入用于获取用户权限资源的 store
import { useAuthStore } from "@/store/modules/auth";

// 应用主组件
const App = () => {
  // 从权限 store 中获取用户资源（用于动态路由生成）
  const resources = useAuthStore((state) => state.resources);

  // 使用 useMemo 缓存动态路由，避免不必要的重新计算
  const dynamicRoutes = useMemo(
    () => generateRoutes(resources || []),
    [resources]
  );

  // 使用 useMemo 缓存所有路由配置，包括静态路由、带权限守卫的基础布局和动态路由，以及任意路由
  const allRoutes = useMemo(
    () => [
      // 添加静态路由
      ...staticRoutes,
      // 定义 /app 路径，使用 AuthGuard 进行权限控制，并应用 BasicLayout
      {
        path: "/app",
        element: (
          <AuthGuard>
            <BasicLayout />
          </AuthGuard>
        ),
        children: [
          // /app 的默认子路由重定向到 /app/dashboard
          {
            path: "",
            element: <Navigate to="dashboard" replace />,
          },
          // 添加动态生成的路由
          ...dynamicRoutes,
        ],
      },
      // 添加任意路由（如 404 页面等）
      ...anyRoutes,
    ],
    [dynamicRoutes]
  );

  // 使用 useRoutes Hook 根据路由配置生成路由元素
  const element = useRoutes(allRoutes);

  // 渲染应用界面
  return (
    // Suspense 用于处理异步组件加载时的回退内容
    <Suspense
      fallback={
        // 加载中的提示，使用 Ant Design 的 Spin 组件
        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin size="large" />
        </div>
      }
    >
      {/* 渲染根据当前 URL 匹配到的路由元素 */}
      {element}
    </Suspense>
  );
};

// 导出 App 组件
export default App;
