import { Spin } from "antd";
import { Suspense } from "react";
import { routes } from "./config/routes";
import { useRoutes } from "react-router-dom";

const App = () => {
  const element = useRoutes(routes);

  return (
    <Suspense
      fallback={
        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin size="large" />
        </div>
      }
    >
      {element}
    </Suspense>
  );
};

export default App;
