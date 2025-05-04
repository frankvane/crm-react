import "./assets/styles/global.less";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import ReactDOM from "react-dom/client";
import zhCN from "antd/locale/zh_CN";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 300000, // 5分钟缓存
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </QueryClientProvider>
);
