import AuthGuard from "@/components/AuthGuard";
import Categories from "@/pages/category/categories";
import CategoryTypes from "@/pages/category/category-types";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/user/Login";
import { Navigate } from "react-router-dom";
import NotFound from "@/pages/404";
import Resources from "@/pages/permission/resources";
import Roles from "@/pages/permission/roles";
import type { RouteObject } from "react-router-dom";
import Users from "@/pages/permission/users";
import { lazy } from "react";

const BasicLayout = lazy(() => import("@/layouts/BasicLayout"));
const UserLayout = lazy(() => import("@/layouts/UserLayout"));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/user/login" replace />,
  },
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
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "permission",
        children: [
          {
            path: "roles",
            element: <Roles />,
          },
          {
            path: "resources",
            element: <Resources />,
          },
          {
            path: "users",
            element: <Users />,
          },
        ],
      },
      {
        path: "category",
        children: [
          {
            path: "category-types",
            element: <CategoryTypes />,
          },
          {
            path: "categories",
            element: <Categories />,
          },
        ],
      },
    ],
  },
  {
    path: "/user",
    element: <UserLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
  {
    path: "/404",
    element: <NotFound />,
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];
