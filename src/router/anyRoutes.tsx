import Login from "@/pages/user/Login";
import { Navigate } from "react-router-dom";
import NotFound from "@/pages/404";
import UserLayout from "@/layouts/UserLayout";

const staticRoutes = [
  {
    path: "/user",
    element: <UserLayout />,
    children: [{ path: "login", element: <Login /> }],
  },
  { path: "/404", element: <NotFound /> },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];

export default staticRoutes;
