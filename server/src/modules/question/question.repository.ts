import { eq, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { questions } from "../../db/schema/questions";
import type { NewQuestion, Question } from "./question.type";

class QuestionRepository {
  public async countAllByQuizId(quizId: string): Promise<number> {
    const result = await db
      .select({ value: sql`count(*)`.mapWith(Number) })
      .from(questions)
      .where(eq(questions.quizId, quizId));
    return result[0]?.value || 0;
  }

  public async findAllByQuizId(quizId: string): Promise<Question[]> {
    const result = await db.select().from(questions).where(eq(questions.quizId, quizId));
    return result || [];
  }

  public async insert(values: NewQuestion): Promise<Question | null> {
    const result = await db.insert(questions).values(values).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async insertAll(values: NewQuestion[]): Promise<undefined> {
    await db.insert(questions).values(values);
  }

  public async update(values: NewQuestion): Promise<Question | null> {
    if (!values.id) return null;
    const result = await db
      .update(questions)
      .set(values)
      .where(eq(questions.id, values.id || ""))
      .returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }
}

export const questionRepository = new QuestionRepository();
