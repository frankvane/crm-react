import "./assets/styles/global.less";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { ConfigProvider } from "antd";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GlobalLoading from "@/components/GlobalLoading";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
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
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <GlobalLoading />
          <App />
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
