import { eq, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { configs } from "../../db/schema";
import type { Config, NewConfig } from "./config.type";

class ConfigRepository {
  public async findAll(): Promise<Config[]> {
    return db.select().from(configs);
  }

  public async existsByKey(key: string): Promise<boolean> {
    const result = await db
      .select({ value: sql`1`.mapWith(Number) })
      .from(configs)
      .where(eq(configs.key, key))
      .limit(1);
    return Boolean(result[0]?.value);
  }

  public async findTopByKey(key: string): Promise<Config | undefined> {
    const result = await db.select().from(configs).where(eq(configs.key, key)).limit(1);
    return result[0];
  }

  public async insert(values: NewConfig): Promise<Config | undefined> {
    const result = await db.insert(configs).values(values).returning();
    return result[0];
  }

  public async update(values: NewConfig): Promise<Config | undefined> {
    const result = await db
      .update(configs)
      .set(values)
      .where(eq(configs.key, values.key || ""))
      .returning();
    return result[0];
  }
}

export const configRepository = new ConfigRepository();
