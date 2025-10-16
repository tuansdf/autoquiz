import viteLegacyPlugin from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    viteLegacyPlugin(),
  ],
});
