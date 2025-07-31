import { quizzes } from "../../db/schema/quizzes";

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type CreateQuizRequest = {
  context: string;
};
