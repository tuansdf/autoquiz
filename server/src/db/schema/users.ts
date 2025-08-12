import { sql } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const users = pgTable(
  "_user",
  {
    id: uuid()
      .primaryKey()
      .$default(() => v7()),
    username: text("username").unique().notNull(),
    isAdmin: boolean("is_admin").default(sql`false`),
    isEnabled: boolean("is_enabled").default(sql`false`),
    tokenValidFrom: timestamp("token_valid_from", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).defaultNow(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      precision: 3,
      mode: "date",
    })
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [uniqueIndex("username_idx").on(table.username)],
);
