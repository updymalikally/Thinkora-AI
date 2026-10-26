import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { listConversations } from "@/lib/conversations";
import { apiError, readJson } from "@/lib/http";


export async function GET(request: NextRequest) {
  const session = await getSession(request.headers);
  if (!session) return apiError(401, "UNAUTHENTICATED", "Sign in to view conversations.");
  try {
    const q = request.nextUrl.searchParams.get("q") ?? "";
    const rows = await listConversations(session.user.id, q);
    return NextResponse.json({ conversations: rows });
  } catch { return apiError(503, "DATABASE_UNAVAILABLE", "Conversations are temporarily unavailable."); }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request.headers);
  if (!session) return apiError(401, "UNAUTHENTICATED", "Sign in to start a conversation.");
  const body = z.object({ title: z.string().trim().min(1).max(120).optional() });
  let parsed;
  try { parsed = body.parse(await readJson(request)); }
  catch { return apiError(400, "INVALID_INPUT", "Conversation details are invalid."); }
  try {
    const [created] = await getDb().insert(conversations).values({ userId: session.user.id, title: parsed.title ?? "New chat" }).returning();
    return NextResponse.json({ conversation: created }, { status: 201 });
  } catch { return apiError(503, "DATABASE_UNAVAILABLE", "The conversation could not be created."); }
}


