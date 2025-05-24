import "./assets/styles/global.less";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { ConfigProvider } from "antd";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import GlobalLoading from "@/components/GlobalLoading";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { createRoot } from "react-dom/client";
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

// Stagewise Toolbar Integration (Development Only)
if (import.meta.env.MODE === "development") {
  const stagewiseConfig = {
    plugins: [],
  };

  // Create a dedicated DOM element for the toolbar
  let toolbarRootElement = document.getElementById("stagewise-toolbar-root");
  if (!toolbarRootElement) {
    toolbarRootElement = document.createElement("div");
    toolbarRootElement.id = "stagewise-toolbar-root";
    document.body.appendChild(toolbarRootElement);
  }

  // Render the toolbar in a separate React root
  const toolbarRoot = createRoot(toolbarRootElement);
  toolbarRoot.render(<StagewiseToolbar config={stagewiseConfig} />);
}
