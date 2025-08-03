import { reactRouter } from "@react-router/dev/vite";
import viteLegacyPlugin from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), viteLegacyPlugin(), reactRouter()],
});
