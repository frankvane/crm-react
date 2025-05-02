import { Navigate, useRoutes } from "react-router-dom";
import { Suspense, useMemo } from "react";

import AuthGuard from "@/components/AuthGuard";
import BasicLayout from "@/layouts/BasicLayout";
import { Spin } from "antd";
import { generateRoutes } from "@/router/dynamicRoutes";
import staticRoutes from "@/router/staticRoutes";
import { useAuthStore } from "@/store/modules/auth";

const App = () => {
  const resources = useAuthStore((state) => state.resources);

  // 动态路由生成
  const dynamicRoutes = useMemo(
    () => generateRoutes(resources || []),
    [resources]
  );

  // 合并静态、动态、任意路由
  const allRoutes = useMemo(
    () => [
      ...staticRoutes,
      {
        path: "/app",
        element: (
          <AuthGuard>
            <BasicLayout />
          </AuthGuard>
        ),
        children: dynamicRoutes,
      },
      { path: "*", element: <Navigate to="/404" replace /> },
    ],
    [dynamicRoutes]
  );

  const element = useRoutes(allRoutes);

  return (
    <Suspense
      fallback={
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
      {element}
    </Suspense>
  );
};

export default App;
