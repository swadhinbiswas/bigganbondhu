import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://0.0.0.0:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
