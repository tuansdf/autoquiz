import { eq, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { users } from "../../db/schema/users";
import type { NewUser, User } from "./user.type";

class UserRepository {
  public async existsAny(): Promise<boolean> {
    const result = await db
      .select({ value: sql`1`.mapWith(Number) })
      .from(users)
      .limit(1);
    return Boolean(result.length && result[0]?.value);
  }

  public async findTopById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async findTopByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async existsByUsername(username: string): Promise<boolean> {
    const result = await db
      .select({ value: sql`1`.mapWith(Number) })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return Boolean(result.length && result[0]?.value);
  }

  public async resetTokenValidity(userId: string): Promise<void> {
    const now = new Date();
    await db.update(users).set({ tokenValidFrom: now, updatedAt: now }).where(eq(users.id, userId));
  }

  public async addFailedAttempts(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        loginFailedAttempts: sql`${users.loginFailedAttempts} + 1`,
        loginLockedUntil: sql`case when ${users.loginFailedAttempts} >= 5 then now() + interval '15 minutes' else ${users.loginLockedUntil} end`,
      })
      .where(eq(users.id, userId));
  }

  public async addSucceededAttempts(userId: string): Promise<void> {
    await db.update(users).set({ loginFailedAttempts: 0 }).where(eq(users.id, userId));
  }

  public async insert(values: NewUser): Promise<User | null> {
    const result = await db.insert(users).values(values).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async update(values: User): Promise<User | null> {
    const result = await db.update(users).set(values).where(eq(users.id, values.id)).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }
}

export const userRepository = new UserRepository();
