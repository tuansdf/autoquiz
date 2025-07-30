import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const quizzes = pgTable(
  "quiz",
  {
    id: uuid()
      .primaryKey()
      .$default(() => v7()),
    context: text("context"),
    contextHash: text("context_hash"),
    questions: text("questions"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).defaultNow(),
  },
  (table) => [index("created_by_idx").on(table.createdBy), index("context_hash_idx").on(table.contextHash)],
);
