import { and, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { quizzes } from "../../db/schema/quizzes";
import type { NewQuiz, Quiz } from "./quiz.type";

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

  public async findAllByCreatedBy(userId: string): Promise<Quiz[]> {
    return db.select().from(quizzes).where(eq(quizzes.createdBy, userId));
  }

  public async insert(values: NewQuiz): Promise<Quiz | null> {
    const result = await db.insert(quizzes).values(values).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async update(values: Quiz): Promise<Quiz | null> {
    const result = await db.update(quizzes).set(values).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }
}

export const quizRepository = new QuizRepository();
