import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";

// Atomic per-user fixed window shared through PostgreSQL across serverless instances.
export async function consumeChatQuota(userId: string) {
  const db = getDb();
  const window = new Date(Math.floor(Date.now() / 60_000) * 60_000);
  const result = await db.execute(sql`insert into "chat_rate_limits" ("user_id", "window_start", "count") values (${userId}, ${window}, 1)
    on conflict ("user_id", "window_start") do update set "count" = "chat_rate_limits"."count" + 1 returning "count"`);
  const count = Number((result.rows[0] as { count: number | string } | undefined)?.count ?? 0);
  return count > 20 ? false : true;
}
