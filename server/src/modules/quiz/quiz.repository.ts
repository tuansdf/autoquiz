import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/db";
import { quizzes } from "../../db/schema";
import type { NewQuiz, Quiz, QuizListItem, QuizPrivate, QuizPublic } from "./quiz.type";

class QuizRepository {
  public async findTopByIdAndCreatedBy(id: string, userId: string): Promise<QuizPrivate | undefined> {
    const result = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        context: quizzes.context,
        isProcessing: quizzes.isProcessing,
        isPublic: quizzes.isPublic,
      })
      .from(quizzes)
      .where(and(eq(quizzes.id, id), eq(quizzes.createdBy, userId)))
      .limit(1);
    return result[0];
  }

  public async findTopByIdAndIsPublic(id: string): Promise<QuizPublic | undefined> {
    const result = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
      })
      .from(quizzes)
      .where(and(eq(quizzes.id, id), eq(quizzes.isPublic, true)))
      .limit(1);
    return result[0];
  }

  public async findAllByCreatedBy(userId: string): Promise<QuizListItem[]> {
    return db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        isProcessing: quizzes.isProcessing,
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

  public async insert(values: NewQuiz): Promise<Quiz | undefined> {
    const result = await db.insert(quizzes).values(values).returning();
    return result[0];
  }

  public async update(values: NewQuiz): Promise<Quiz | undefined> {
    if (!values.id) return;
    const result = await db.update(quizzes).set(values).where(eq(quizzes.id, values.id)).returning();
    return result[0];
  }
}

export const quizRepository = new QuizRepository();
