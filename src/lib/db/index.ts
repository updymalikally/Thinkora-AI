import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { requireEnv } from "@/lib/env";

let cached: ReturnType<typeof drizzle<typeof schema>> | undefined;
export function getDb() {
  if (!cached) cached = drizzle(neon(requireEnv("DATABASE_URL")), { schema });
  return cached;
}
