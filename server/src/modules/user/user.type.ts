import type { users } from "../../db/schema";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
