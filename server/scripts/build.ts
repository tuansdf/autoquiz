import { $ } from "bun";
import { cpSync, existsSync } from "node:fs";

await $`rm -rf dist`;

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "bun",
  sourcemap: "linked",
});

if (existsSync(".env")) {
  cpSync(".env", "dist/.env");
}

if (existsSync("../client/build/client")) {
  cpSync("../client/build/client", "dist/static", { recursive: true });
}
