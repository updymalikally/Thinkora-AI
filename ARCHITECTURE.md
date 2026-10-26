# Thinkora AI Architecture

## Stack
Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui-compatible primitives, Lucide React, Better Auth, Drizzle ORM, Neon PostgreSQL, Zod, Sonner, OpenRouter (`openai/gpt-4o-mini`), npm, and Vercel. Keep these choices unless a documented technical blocker is found.

## Boundaries and structure
- `app/`: route pages, layouts, route handlers.
- `components/`: shell, chat, auth, settings and reusable UI.
- `lib/auth/`: Better Auth server/client configuration.
- `lib/db/`: Drizzle schema, client and queries.
- `lib/ai/`: server-only OpenRouter client and stream handling.
- `lib/validation/`: Zod schemas and environment validation.
- `drizzle/`: generated SQL migrations.
- `docs` are root-level source documents.

Server components load session and initial data. Client components handle interactive composer and streamed display. Route handlers authenticate, validate, authorize and call narrowly scoped services. The browser never receives provider/database credentials.

## Authentication and data access
Better Auth owns user, account, session, and verification records. Drizzle uses Neon serverless PostgreSQL. Every user-data query is scoped by the session user ID. Migrations are reviewed and applied explicitly; production migration instructions use additive, recoverable changes.

## AI stream lifecycle
POST chat endpoint verifies session, parses bounded JSON with Zod, verifies owned conversation, checks a per-user rate limit, and persists the user turn before opening a provider stream. It calls the fixed model using a server-only key and bounded history. The response is streamed as plain text/SSE-compatible data. On successful completion, persist the assistant turn and update conversation activity. On cancellation/provider failure, persist an explicit failed/interrupted status where possible and return a useful error; never claim an incomplete assistant answer is complete. Client abort propagates to provider request where supported. Use an idempotency key per submission to limit duplicates.

## Security and operations
Validate environment at server startup/use; secure cookies in production; configure trusted origins; enforce same-origin/CSRF protections appropriate to Better Auth; bound body, history and output; throttle chat requests; avoid sensitive content in logs. Markdown uses safe rendering with raw HTML disabled. Vercel functions must support streaming and suitable duration limits. Monitoring is platform logs plus sanitized error events; backups/recovery are Neon plan/owner configuration.

## Verification
Typecheck, lint, focused unit/integration tests, critical browser journeys, and production build. External OAuth, Neon and OpenRouter behavior requires credentials and cannot be certified by a local build alone. See implementation plan in `IMPLEMENTATION_PLAN.md`.
