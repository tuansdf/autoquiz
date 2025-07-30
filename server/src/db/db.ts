import { drizzle } from "drizzle-orm/node-postgres";
import { Env } from "../env";

export const db = drizzle(Env.DB_URL);

await db.execute("select 1");
