import { and, asc, eq, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { ownedConversation } from "@/lib/conversations";
import { getDb } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { apiError, readJson } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };
const idSchema = z.string().uuid();

export async function GET(request: NextRequest, { params }: Params) {
  const session = await getSession(request.headers);
  if (!session) return apiError(401, "UNAUTHENTICATED", "Sign in to view this conversation.");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return apiError(404, "NOT_FOUND", "Conversation not found.");
  try {
    if (!(await ownedConversation(session.user.id, id))) return apiError(404, "NOT_FOUND", "Conversation not found.");
    await getDb().update(messages).set({ status: "interrupted" }).where(and(eq(messages.conversationId, id), eq(messages.status, "streaming"), lt(messages.createdAt, new Date(Date.now() - 180_000))));
    const history = await getDb().select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));
    return NextResponse.json({ messages: history });
  } catch { return apiError(503, "DATABASE_UNAVAILABLE", "Conversation history is temporarily unavailable."); }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession(request.headers);
  if (!session) return apiError(401, "UNAUTHENTICATED", "Sign in to rename this conversation.");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return apiError(404, "NOT_FOUND", "Conversation not found.");
  let title: string;
  try { title = z.object({ title: z.string().trim().min(1).max(120) }).parse(await readJson(request, 4_000)).title; }
  catch { return apiError(400, "INVALID_INPUT", "Title must be between 1 and 120 characters."); }
  try {
    const [row] = await getDb().update(conversations).set({ title, updatedAt: new Date() }).where(and(eq(conversations.id, id), eq(conversations.userId, session.user.id))).returning();
    return row ? NextResponse.json({ conversation: row }) : apiError(404, "NOT_FOUND", "Conversation not found.");
  } catch { return apiError(503, "DATABASE_UNAVAILABLE", "The conversation could not be renamed."); }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getSession(request.headers);
  if (!session) return apiError(401, "UNAUTHENTICATED", "Sign in to delete this conversation.");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return apiError(404, "NOT_FOUND", "Conversation not found.");
  try {
    const [row] = await getDb().delete(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, session.user.id))).returning({ id: conversations.id });
    return row ? new NextResponse(null, { status: 204 }) : apiError(404, "NOT_FOUND", "Conversation not found.");
  } catch { return apiError(503, "DATABASE_UNAVAILABLE", "The conversation could not be deleted."); }
}

