import { and, asc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { ownedConversation, touchConversation } from "@/lib/conversations";
import { getDb } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { apiError, readJson } from "@/lib/http";
import { consumeChatQuota } from "@/lib/rate-limit";

export const maxDuration = 120;

const payloadSchema = z.object({ content: z.string().trim().min(1).max(8_000), idempotencyKey: z.string().uuid() });
type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const session = await getSession(request.headers);
  if (!session) return apiError(401, "UNAUTHENTICATED", "Sign in to send a message.");
  if (!env.OPENROUTER_API_KEY) return apiError(503, "AI_NOT_CONFIGURED", "AI responses are not configured on this server.");
  if (Number(request.headers.get("content-length") ?? 0) > 12_000) return apiError(413, "REQUEST_TOO_LARGE", "Message request is too large.");
  const { id } = await params;
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return apiError(404, "NOT_FOUND", "Conversation not found.");
  let payload: z.infer<typeof payloadSchema>;
  try { payload = payloadSchema.parse(await readJson(request, 12_000)); }
  catch { return apiError(400, "INVALID_INPUT", "Message must contain between 1 and 8,000 characters."); }

  let conversation;
  try { conversation = await ownedConversation(session.user.id, id); }
  catch { return apiError(503, "DATABASE_UNAVAILABLE", "The conversation could not be loaded."); }
  if (!conversation) return apiError(404, "NOT_FOUND", "Conversation not found.");

  try {
    const ok = await consumeChatQuota(session.user.id);
    if (!ok) return apiError(429, "RATE_LIMITED", "Too many messages. Try again in a minute.");
    const duplicate = await getDb().select({ id: messages.id }).from(messages).where(and(eq(messages.conversationId, id), eq(messages.idempotencyKey, payload.idempotencyKey))).limit(1);
    if (duplicate.length) return apiError(409, "DUPLICATE_SUBMISSION", "This message was already submitted.");

    const [saved] = await getDb().insert(messages).values({ conversationId: id, role: "user", content: payload.content, status: "complete", idempotencyKey: payload.idempotencyKey }).onConflictDoNothing().returning({ id: messages.id });
    if (!saved) return apiError(409, "DUPLICATE_SUBMISSION", "This message was already submitted.");
    if (conversation.title === "New chat") {
      await getDb().update(conversations).set({ title: payload.content.slice(0, 60), updatedAt: new Date() }).where(and(eq(conversations.id, id), eq(conversations.userId, session.user.id)));
    }
    await touchConversation(id);
  } catch { return apiError(503, "DATABASE_UNAVAILABLE", "Your message could not be saved. Please try again."); }

  let assistantId: string;
  let history: { role: "user" | "assistant"; content: string }[];
  try {
    const rows = await getDb().select({ id: messages.id, role: messages.role, content: messages.content, status: messages.status }).from(messages)
      .where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));
    const selected: { role: "user" | "assistant"; content: string }[] = [];
    let remaining = 40_000;
    for (const row of rows.filter((m) => m.status === "complete").slice(-24).reverse()) {
      if (remaining <= 0) break;
      const content = row.content.slice(-remaining);
      selected.unshift({ role: row.role, content });
      remaining -= content.length;
    }
    history = selected;
    const [assistant] = await getDb().insert(messages).values({ conversationId: id, role: "assistant", content: "", status: "streaming" }).returning({ id: messages.id });
    assistantId = assistant.id;
  } catch { return apiError(503, "DATABASE_UNAVAILABLE", "The message was saved, but a response could not be started."); }

  const providerController = new AbortController();
  const timeout = setTimeout(() => providerController.abort(new Error("Provider timeout")), 90_000);
  let provider: Response;
  try {
    provider = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST", signal: providerController.signal,
      headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}`, "Content-Type": "application/json", "HTTP-Referer": env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000", "X-Title": "Thinkora AI" },
      body: JSON.stringify({ model: "openai/gpt-4o-mini", stream: true, max_tokens: 2_048, messages: history }),
    });
    if (!provider.ok || !provider.body) throw new Error("Provider rejected the request");
  } catch {
    clearTimeout(timeout);
    await getDb().update(messages).set({ status: "failed" }).where(eq(messages.id, assistantId));
    return apiError(502, "AI_PROVIDER_ERROR", "The AI service could not start a response. You can retry this message.");
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = provider.body.getReader();
  let buffer = "";
  let answer = "";
  let closed = false;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            clearTimeout(timeout);
            if (!answer) throw new Error("Empty provider response");
            await getDb().update(messages).set({ content: answer, status: "complete" }).where(eq(messages.id, assistantId));
            await touchConversation(id);
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close(); closed = true; return;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const event = JSON.parse(data) as { choices?: { delta?: { content?: string } }[]; error?: { message?: string } };
              const chunk = event.choices?.[0]?.delta?.content;
              if (chunk) { answer += chunk; controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}

`)); }
            } catch { /* Ignore provider keepalives and incomplete records. */ }
          }
          return;
        }
      } catch {
        clearTimeout(timeout);
        try { await getDb().update(messages).set({ content: answer, status: "failed" }).where(eq(messages.id, assistantId)); } catch { /* Preserve stream failure response. */ }
        if (!closed) { controller.enqueue(encoder.encode(`event: error
data: ${JSON.stringify({ message: "The response was interrupted. You can retry." })}

`)); controller.close(); closed = true; }
      }
    },
    async cancel() {
      clearTimeout(timeout); providerController.abort(); await reader.cancel();
      if (!closed) { try { await getDb().update(messages).set({ content: answer, status: "interrupted" }).where(eq(messages.id, assistantId)); } catch { /* best-effort interruption marker */ } }
      closed = true;
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
}









