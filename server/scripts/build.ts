import { $ } from "bun";

await $`rm -rf dist`;

await Bun.build({
  entrypoints: ["./src/server.ts"],
  outdir: "./dist",
  target: "bun",
  sourcemap: "linked",
});

await $`cp .env dist/.env`;
