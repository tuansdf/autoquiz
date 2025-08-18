import { index, json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";
import type { Answer } from "../../modules/question/question.type";

export const questions = pgTable(
  "question",
  {
    id: uuid()
      .primaryKey()
      .$default(() => v7()),
    text: text("text"),
    answers: json("answers").$type<Answer[]>(),
    explanation: text("explanation"),
    quizId: uuid("quiz_id"),
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
  (table) => [index("quiz_id_idx").on(table.quizId)],
);
