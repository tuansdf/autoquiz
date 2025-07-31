import type { configs } from "../../db/schema/configs";

export type Config = typeof configs.$inferSelect;
export type NewConfig = typeof configs.$inferInsert;
