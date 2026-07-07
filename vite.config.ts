import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
  },
  vite: {
    server: {
      proxy: {
        "/api/auth": {
          target: "http://localhost:4000",
          changeOrigin: true,
        },
        "/api/dashboard": {
          target: "http://localhost:4000",
          changeOrigin: true,
        },
        "/api/admin": {
          target: "http://localhost:4000",
          changeOrigin: true,
        },
        "/api/wallet": {
          target: "http://localhost:4000",
          changeOrigin: true,
        },
      },
    },
  },
});
