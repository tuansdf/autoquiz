import { quizzes } from "../../db/schema/quizzes";
import type { MakeNullish } from "../../types";

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type CreateQuizRequest = {
  context: string;
};

export type QuizListItem = MakeNullish<{
  id: string;
  title: string;
  isProcessing: boolean;
  createdAt: Date;
}>;

export type QuizPublic = MakeNullish<{
  id: string;
  title: string;
  questions: string;
}>;

export type QuizPrivate = MakeNullish<{
  id: string;
  title: string;
  context: string;
  isProcessing: boolean;
  isPublic: boolean;
  questions: string;
}>;
