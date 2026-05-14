import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, esmExternalRequirePlugin } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["cloudflare:workers"],
    },
  },
  plugins: [
    tanstackStart({ server: { entry: "worker" } }),
    viteReact(),
    esmExternalRequirePlugin(),
  ],
});
