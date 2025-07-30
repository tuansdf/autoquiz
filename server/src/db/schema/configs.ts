import { pgTable, text } from "drizzle-orm/pg-core";

export const configs = pgTable("config", {
  key: text("key").primaryKey(),
  value: text("value"),
});
