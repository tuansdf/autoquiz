import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { quizzes } from "../../db/schema/quizzes";
import type { NewQuiz, Quiz, QuizListItem, QuizPublic } from "./quiz.type";

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

  public async findTopByIdAndIsPublic(id: string): Promise<QuizPublic | null> {
    const result = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        questions: quizzes.questions,
      })
      .from(quizzes)
      .where(and(eq(quizzes.id, id), eq(quizzes.isPublic, true)))
      .limit(1);
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async findAllByCreatedBy(userId: string): Promise<QuizListItem[]> {
    return db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        ok: quizzes.ok,
        createdAt: quizzes.createdAt,
      })
      .from(quizzes)
      .where(eq(quizzes.createdBy, userId))
      .orderBy(desc(quizzes.id));
  }

  public async updateIsPublicByIdAndUserId(id: string, userId: string, value: boolean): Promise<void> {
    await db
      .update(quizzes)
      .set({ isPublic: value })
      .where(and(eq(quizzes.id, id), eq(quizzes.createdBy, userId)));
  }

  public async insert(values: NewQuiz): Promise<Quiz | null> {
    const result = await db.insert(quizzes).values(values).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async update(values: NewQuiz): Promise<Quiz | null> {
    if (!values.id) return null;
    const result = await db.update(quizzes).set(values).where(eq(quizzes.id, values.id)).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }
}

export const quizRepository = new QuizRepository();
