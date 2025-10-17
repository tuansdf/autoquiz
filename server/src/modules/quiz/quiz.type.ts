import { z } from "zod";
import { quizzes } from "../../db/schema";
import type { MakeNullish } from "../../types";
import type { quizSchemas } from "./quiz.schema";

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type CreateQuizRequest = z.infer<typeof quizSchemas.create>;

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
