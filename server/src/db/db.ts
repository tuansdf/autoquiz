import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Env } from "../env";

const pool = new Pool({
  connectionString: Env.DB_URL,
  min: 2,
  max: 20,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 7_000,
  allowExitOnIdle: false,
  keepAlive: true,
});
export const db = drizzle({ client: pool });

await db.execute("select 1");
