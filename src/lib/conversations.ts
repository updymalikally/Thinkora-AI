import { and, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";

export async function listConversations(userId: string, query?: string) {
  const db = getDb();
  if (!query?.trim()) return db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt)).limit(100);
  const term = `%${query.trim().slice(0, 120)}%`;
  return db.selectDistinct({ id: conversations.id, userId: conversations.userId, title: conversations.title, createdAt: conversations.createdAt, updatedAt: conversations.updatedAt })
    .from(conversations).leftJoin(messages, eq(messages.conversationId, conversations.id))
    .where(and(eq(conversations.userId, userId), or(ilike(conversations.title, term), ilike(messages.content, term))))
    .orderBy(desc(conversations.updatedAt)).limit(100);
}

export async function ownedConversation(userId: string, id: string) {
  const rows = await getDb().select().from(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, userId))).limit(1);
  return rows[0] ?? null;
}

export async function touchConversation(id: string) {
  await getDb().update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, id));
}

