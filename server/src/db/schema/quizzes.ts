import { sql } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const quizzes = pgTable(
  "quiz",
  {
    id: uuid()
      .primaryKey()
      .$default(() => v7()),
    context: text("context"),
    contextHash: text("context_hash"),
    title: text("title"),
    questions: text("questions"),
    isPublic: boolean("is_public").default(sql`false`),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("created_by_idx").on(table.createdBy), index("context_hash_idx").on(table.contextHash)],
);
