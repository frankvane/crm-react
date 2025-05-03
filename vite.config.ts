import { createHtmlPlugin } from "vite-plugin-html";
import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";

const isProd = process.env.NODE_ENV === "production";

const cdnScripts = [
  '<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/lodash@4/lodash.min.js"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/axios@1/dist/axios.min.js"></script>',
].join("\n");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          cdn: isProd ? cdnScripts : "",
        },
      },
    }),
  ],
  ...(isProd
    ? {
        optimizeDeps: {
          exclude: ["react", "react-dom", "lodash", "axios"],
          include: ["dayjs"],
        },
        build: {
          rollupOptions: {
            external: ["react", "react-dom", "lodash", "axios"],
            output: {
              globals: {
                react: "React",
                "react-dom": "ReactDOM",
                lodash: "_",
                axios: "axios",
              },
              format: "iife",
            },
          },
        },
      }
    : {}),
  // 别名、后缀
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx"],
  },
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[local]_[hash:base64:5]",
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
