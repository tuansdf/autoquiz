import { eq } from "drizzle-orm";
import { db } from "../../db/db";
import { questions } from "../../db/schema";
import type { NewQuestion, Question } from "./question.type";

class QuestionRepository {
  public async countAllByQuizId(quizId: string): Promise<number> {
    return db.$count(questions, eq(questions.quizId, quizId));
  }

  public async findAllByQuizId(quizId: string): Promise<Question[]> {
    const result = await db.select().from(questions).where(eq(questions.quizId, quizId));
    return result || [];
  }

  public async insert(values: NewQuestion): Promise<Question | undefined> {
    const result = await db.insert(questions).values(values).returning();
    return result[0];
  }

  public async insertAll(values: NewQuestion[]): Promise<void> {
    await db.insert(questions).values(values);
  }

  public async update(values: NewQuestion): Promise<Question | undefined> {
    if (!values.id) return;
    const result = await db.update(questions).set(values).where(eq(questions.id, values.id)).returning();
    return result[0];
  }
}

export const questionRepository = new QuestionRepository();
