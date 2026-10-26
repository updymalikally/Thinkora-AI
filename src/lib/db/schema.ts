import { relations, sql } from "drizzle-orm";
import { boolean, index, integer, pgTable, text, timestamp, uuid, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false), image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(), updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const session = pgTable("session", {
  id: text("id").primaryKey(), expiresAt: timestamp("expires_at").notNull(), token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(), updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"), userAgent: text("user_agent"), userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (t) => [index("session_user_idx").on(t.userId)]);
export const account = pgTable("account", {
  id: text("id").primaryKey(), accountId: text("account_id").notNull(), providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }), accessToken: text("access_token"),
  refreshToken: text("refresh_token"), idToken: text("id_token"), accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"), scope: text("scope"), password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(), updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("account_user_idx").on(t.userId), uniqueIndex("account_provider_account_idx").on(t.providerId, t.accountId)]);
export const verification = pgTable("verification", {
  id: text("id").primaryKey(), identifier: text("identifier").notNull(), value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(), createdAt: timestamp("created_at").defaultNow(), updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [index("verification_identifier_idx").on(t.identifier)]);

export const messageRole = pgEnum("message_role", ["user", "assistant"]);
export const messageStatus = pgEnum("message_status", ["complete", "streaming", "failed", "interrupted"]);
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(), userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("New chat"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("conversation_owner_updated_idx").on(t.userId, t.updatedAt)]);
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(), conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: messageRole("role").notNull(), content: text("content").notNull(), status: messageStatus("status").notNull().default("complete"),
  idempotencyKey: text("idempotency_key"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("message_conversation_created_idx").on(t.conversationId, t.createdAt, t.id), uniqueIndex("message_idempotency_idx").on(t.conversationId, t.idempotencyKey).where(sql`${t.idempotencyKey} IS NOT NULL`)]);

export const chatRateLimits = pgTable("chat_rate_limits", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(), count: integer("count").notNull().default(0),
}, (t) => [uniqueIndex("chat_rate_limit_user_window_idx").on(t.userId, t.windowStart)]);

export const conversationRelations = relations(conversations, ({ many }) => ({ messages: many(messages) }));
export const messageRelations = relations(messages, ({ one }) => ({ conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }) }));
