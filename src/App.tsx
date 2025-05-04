import { Navigate, useRoutes } from "react-router-dom";
import { Suspense, useMemo } from "react";

import AuthGuard from "@/components/AuthGuard";
import BasicLayout from "@/layouts/BasicLayout";
import { Spin } from "antd";
import anyRoutes from "@/router/anyRoutes";
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
        children: [
          {
            path: "",
            element: <Navigate to="dashboard" replace />,
          },
          ...dynamicRoutes,
        ],
      },
      ...anyRoutes,
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
