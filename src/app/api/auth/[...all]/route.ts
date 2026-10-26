import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";
import { env } from "@/lib/env";
async function dispatch(request: NextRequest) {
  if (!env.DATABASE_URL || !env.BETTER_AUTH_SECRET || !env.BETTER_AUTH_URL) return NextResponse.json({ error: { code: "AUTH_NOT_CONFIGURED", message: "Authentication is not configured on this server." } }, { status: 503 });
  const handlers = toNextJsHandler(getAuth());
  return request.method === "GET" ? handlers.GET(request) : handlers.POST(request);
}
export const GET = dispatch;
export const POST = dispatch;
