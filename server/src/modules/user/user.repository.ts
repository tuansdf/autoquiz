import { eq, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { users } from "../../db/schema";
import type { NewUser, User } from "./user.type";

class UserRepository {
  public async existsAny(): Promise<boolean> {
    const result = await db
      .select({ value: sql`1`.mapWith(Number) })
      .from(users)
      .limit(1);
    return Boolean(result[0]?.value);
  }

  public async findTopById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  public async findTopByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  public async resetTokenValidity(userId: string): Promise<void> {
    const now = new Date();
    await db.update(users).set({ tokenValidFrom: now, updatedAt: now }).where(eq(users.id, userId));
  }

  public async insert(values: NewUser): Promise<User | undefined> {
    const result = await db.insert(users).values(values).returning();
    return result[0];
  }

  public async update(values: NewUser): Promise<User | undefined> {
    if (!values.id) return;
    const result = await db.update(users).set(values).where(eq(users.id, values.id)).returning();
    return result[0];
  }
}

export const userRepository = new UserRepository();
