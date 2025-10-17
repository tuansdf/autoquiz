import type { configs } from "../../db/schema";

export type Config = typeof configs.$inferSelect;
export type NewConfig = typeof configs.$inferInsert;
