import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

const apiProxy = {
  target: "http://localhost:8000",
  changeOrigin: true,
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/auth": apiProxy,
      "/admin": apiProxy,
      "/health": apiProxy,
      "/predict": apiProxy,
      "/simulate": apiProxy,
      "/history": apiProxy,
      "/dashboard": apiProxy,
      "/analytics": apiProxy,
      "/ml": apiProxy,
      "/support/contact": apiProxy,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "recharts";
          }
        },
      },
    },
  },
});
