import { questions } from "../../db/schema/questions";
import type { MakeNullish } from "../../types";

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type Answer = MakeNullish<{
  id: string;
  text: string;
  correct: boolean;
}>;
