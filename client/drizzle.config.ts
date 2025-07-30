import { ENV } from "@/server/constants/env.constant";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/server/db/schemas/*.schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: ENV.DB_URL,
  },
});
