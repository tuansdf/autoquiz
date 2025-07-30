import { reactRouter } from "@react-router/dev/vite";
import viteLegacyPlugin from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    viteLegacyPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: { theme_color: "#ffffff" },
    }),
  ],
});
