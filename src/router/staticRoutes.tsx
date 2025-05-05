import { Navigate } from "react-router-dom";

const staticRoutes = [{ path: "/", element: <Navigate to="/login" replace /> }];

export default staticRoutes;
