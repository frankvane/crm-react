import type {
	AxiosError,
	AxiosInstance,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from "axios";

import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { message } from "antd";

// 配置全局消息提示
message.config({
	maxCount: 1,
	duration: 3,
	top: 24,
});

// 简洁的消息函数
export const showErrorMessage = (content: string) => message.error(content);
export const showSuccessMessage = (content: string) => message.success(content);

interface RefreshTokenResponse {
	code: number;
	message: string;
	data: {
		accessToken: string;
		refreshToken: string;
	};
}

// 创建axios实例
const request: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
	timeout: 50000,
	headers: {
		"Content-Type": "application/json",
	},
});

// 请求拦截器
request.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		// 从 localStorage 获取 token
		const token = localStorage.getItem("accessToken");

		// 如果存在 token，添加到请求头
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		// 开启全局 loading
		// useGlobalLoading.getState().start();

		return config;
	},
	(error: AxiosError) => {
		// useGlobalLoading.getState().end();
		message.error("请求发送失败");
		return Promise.reject(error);
	},
);

// 响应拦截器
request.interceptors.response.use(
	(response: AxiosResponse) => {
		// useGlobalLoading.getState().end();
		const { data } = response;
		// 处理业务状态码
		if (data.code !== 200) {
			// 统一业务错误提示
			message.error(data.message || "请求失败");
			return Promise.reject(new Error(data.message || "请求失败"));
		}
		return data.data;
	},
	(error: AxiosError) => {
		// useGlobalLoading.getState().end();
		if (error.response) {
			const { status, data } = error.response as any;
			const apiMessage = data && data.message;
			switch (status) {
				case 401:
					// 401 由 axios-auth-refresh 处理
					break;
				case 403:
					message.error(apiMessage || "拒绝访问");
					break;
				case 404:
					message.error(apiMessage || "请求的资源不存在");
					break;
				case 500:
					message.error(apiMessage || "服务器错误");
					break;
				default:
					message.error(apiMessage || "网络错误");
			}
		} else if (error.request) {
			if (error.code === "ERR_CANCELED") {
				message.error("请求被取消");
				return Promise.reject(error);
			} else if (error.code === "ERR_NETWORK") {
				message.error("网络连接失败，请检查网络");
			} else if (error.code === "ERR_BAD_REQUEST") {
				message.error("请求参数错误");
			}
		} else {
			message.error("请求失败");
		}
		// 开发环境统一 log
		if (import.meta.env.DEV) {
			// eslint-disable-next-line no-console
			console.error("Axios Error:", error);
		}
		return Promise.reject(error);
	},
);

// 配置 token 刷新
const refreshAuthLogic = (failedRequest: {
	response: { config: { headers: { Authorization: string } } };
}) => {
	console.log("refreshAuthLogic????????????");

	const refreshToken = localStorage.getItem("refreshToken");

	if (!refreshToken) {
		return Promise.reject(failedRequest);
	}

	return axios
		.post<RefreshTokenResponse>(
			`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
			{ refreshToken },
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		)
		.then((response) => {
			const { accessToken, refreshToken: newRefreshToken } = response.data.data;

			// 更新本地存储的 token
			localStorage.setItem("accessToken", accessToken);
			localStorage.setItem("refreshToken", newRefreshToken);

			// 更新失败请求的 Authorization 头
			failedRequest.response.config.headers.Authorization = `Bearer ${accessToken}`;

			return Promise.resolve();
		})
		.catch(() => {
			// 刷新 token 失败，清除本地存储并跳转到登录页（带 redirect）
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			window.location.href =
				"/login?redirect=" +
				encodeURIComponent(window.location.pathname + window.location.search);
			return Promise.reject(failedRequest);
		});
};

// 添加刷新 token 的拦截器
createAuthRefreshInterceptor(request, refreshAuthLogic, {
	statusCodes: [401], // 当响应状态码为 401 时触发刷新
});

export default request;
