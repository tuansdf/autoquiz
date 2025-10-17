import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Env } from "../env";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: Env.DB_URL,
  min: 2,
  max: 20,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 7_000,
  allowExitOnIdle: false,
  keepAlive: true,
});
export const db = drizzle({ client: pool, schema });

await db.execute("select 1");
