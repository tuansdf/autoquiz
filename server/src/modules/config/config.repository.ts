import { eq, sql } from "drizzle-orm";
import { db } from "../../db/db";
import { configs } from "../../db/schema/configs";
import type { Config, NewConfig } from "./config.type";

class ConfigRepository {
  public async findAll(): Promise<Config[]> {
    return db.select().from(configs);
  }

  public async existsByKey(key: string): Promise<boolean> {
    const result = await db
      .select({ count: sql`1`.mapWith(Number) })
      .from(configs)
      .where(eq(configs.key, key))
      .limit(1);
    return Boolean(result.length && result[0]);
  }

  public async findTopByKey(key: string): Promise<Config | null> {
    const result = await db.select().from(configs).where(eq(configs.key, key)).limit(1);
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async insert(values: NewConfig): Promise<Config | null> {
    const result = await db.insert(configs).values(values).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }

  public async update(values: Config): Promise<Config | null> {
    const result = await db.update(configs).set(values).returning();
    if (!result.length || !result[0]) return null;
    return result[0];
  }
}

export const configRepository = new ConfigRepository();
