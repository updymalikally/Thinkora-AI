# Thinkora AI Database

## PostgreSQL model
Use Better Auth's supported Drizzle schema definitions for:
- `user`: text primary key, name, unique email, verified flag, image, timestamps.
- `session`: text primary key, expiry, unique token, timestamps, IP/user agent, user foreign key with cascade delete and user index.
- `account`: text primary key, provider/account identifiers, user foreign key with cascade delete, OAuth tokens/expiry/scope/password fields per Better Auth adapter, user index and provider/account uniqueness.
- `verification`: text primary key, identifier, value, expiry and timestamps; identifier index.

Application tables:
- `conversations`: UUID primary key; `user_id` text NOT NULL references user with cascade delete; title text NOT NULL (bounded); created/updated timestamps with timezone; index `(user_id, updated_at DESC)`.
- `messages`: UUID primary key; `conversation_id` UUID NOT NULL references conversations with cascade delete; role enum (`user`, `assistant`); content text NOT NULL; status enum (`complete`, `streaming`, `failed`, `interrupted`); nullable idempotency key; created timestamp with timezone; unique `(conversation_id, idempotency_key)` when key is non-null; index `(conversation_id, created_at, id)`.
- `chat_rate_limits`: user ID and UTC minute window as a composite unique key; atomic count increment for a shared per-user rate limit across serverless instances; cascade with user deletion.

## Invariants and ownership
All conversation/message reads and writes are scoped by authenticated owner; message insertion checks the parent conversation owner in the same transaction/service operation. Browser input never selects a user ID. Search joins messages through owned conversations. Conversation title defaults from first user message with a bounded, plain-text excerpt. Empty or excessively long content is rejected.

## Migrations and recovery
Keep schema definitions and checked-in SQL migrations aligned. Generate migrations locally and review before applying. Apply migrations before deployment, with a Neon branch/backup for production recovery. No destructive production migration without explicit approval. Retention/deletion follows user deletion cascade; recovery relies on Neon backup/restore configured by the operator.

## Operational notes
Use pooled Neon connection configuration for serverless runtime and a direct connection where migration tooling requires it. Require TLS and least-privilege credentials. Never log message bodies or credentials.
