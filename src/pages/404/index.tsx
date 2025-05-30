import { Button, Result } from "antd";

import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
	const navigate = useNavigate();

	return (
		<Result
			status="404"
			title="404"
			subTitle="抱歉，您访问的页面不存在。"
			extra={
				<>
					<Button type="primary" onClick={() => navigate("/login")}>
						返回登录
					</Button>
					<Button type="primary" onClick={() => navigate("/app/dashboard")}>
						返回首页
					</Button>
				</>
			}
		/>
	);
};

export default NotFound;
