import { quizzes } from "../../db/schema/quizzes";
import type { MakeNullish } from "../../types.js";

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type CreateQuizRequest = {
  context: string;
};

export type QuizListItem = MakeNullish<{
  id: string;
  title: string;
  createdAt: Date;
  generated: boolean;
}>;
