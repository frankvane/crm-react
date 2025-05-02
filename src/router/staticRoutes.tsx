import { Navigate } from "react-router-dom";

const staticRoutes = [
  { path: "/", element: <Navigate to="/user/login" replace /> },
];

export default staticRoutes;
