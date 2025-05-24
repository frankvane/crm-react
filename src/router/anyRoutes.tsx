import Login from "@/pages/login";
import { Navigate } from "react-router-dom";
import NotFound from "@/pages/404";

const staticRoutes = [
	{ path: "/login", element: <Login /> },
	{ path: "/404", element: <NotFound /> },
	{
		path: "*",
		element: <Navigate to="/404" replace />,
	},
];

export default staticRoutes;
