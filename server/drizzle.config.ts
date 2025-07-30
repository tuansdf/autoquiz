import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { Env } from "./src/env";

export default defineConfig({
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: Env.DB_URL,
  },
});
