import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { quizzes } from "../../db/schema/quizzes";
import type { NewQuiz, Quiz, QuizListItem } from "./quiz.type";

class QuizRepository {
  public async findTopByIdAndCreatedBy(id: string, userId: string): Promise<Quiz | null> {
    const result = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.id, id), eq(quizzes.createdBy, userId)))
      .limit(1);
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async findAllByCreatedBy(userId: string): Promise<QuizListItem[]> {
    return db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        createdAt: quizzes.createdAt,
        generated: sql<boolean>`(${quizzes.questions} is not null)`,
      })
      .from(quizzes)
      .where(eq(quizzes.createdBy, userId));
  }

  public async insert(values: NewQuiz): Promise<Quiz | null> {
    const result = await db.insert(quizzes).values(values).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async update(values: Quiz): Promise<Quiz | null> {
    const result = await db.update(quizzes).set(values).where(eq(quizzes.id, values.id)).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }
}

export const quizRepository = new QuizRepository();
