import { eq, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { users } from "../../db/schema/users";
import type { NewUser, User } from "./user.type";

class UserRepository {
  public async existsAny(): Promise<boolean> {
    const result = await db
      .select({ count: sql`1`.mapWith(Number) })
      .from(users)
      .limit(1);
    return Boolean(result.length && result[0]);
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
      .select({ count: sql`1`.mapWith(Number) })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return Boolean(result.length && result[0]);
  }

  public async resetTokenValidity(userId: string): Promise<void> {
    const now = new Date();
    await db.update(users).set({ tokenValidFrom: now, updatedAt: now }).where(eq(users.id, userId));
  }

  public async insert(user: NewUser): Promise<User | null> {
    const result = await db.insert(users).values(user).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async update(user: User): Promise<User | null> {
    const result = await db.update(users).set(user).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }
}

export const userRepository = new UserRepository();
