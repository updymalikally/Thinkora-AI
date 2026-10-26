# Thinkora AI API

## Conventions
All application endpoints are same-origin `/api` routes. JSON errors use `{ "error": { "code": "...", "message": "..." } }`. Zod validates every external payload. Session identity is resolved server-side. Conversation IDs are UUIDs. Return 401 unauthenticated, 404 missing or non-owned resource (avoid ownership disclosure), 400 invalid input, 409 duplicate/conflict, 413 excessive request, 429 throttled, and 5xx for service failure.

## Endpoints
- Better Auth handler: `/api/auth/[...all]` (Better Auth supported methods).
- `GET /api/conversations?q=&limit=&cursor=`: authenticated list/search; title and message text; user-scoped.
- `POST /api/conversations`: create blank conversation; returns conversation.
- `GET /api/conversations/:id`: conversation and ordered messages; owner only.
- `PATCH /api/conversations/:id`: validate and update bounded title; owner only.
- `DELETE /api/conversations/:id`: owner-only cascade deletion; idempotency policy documented by implementation.
- `POST /api/conversations/:id/messages`: JSON `{ content, idempotencyKey }`, authenticated, bounded message/history/output. Persist user message before provider call. Return Server-Sent Events (`data: {"text":"..."}` and `data: [DONE]`) with no-store headers; errors before stream use JSON error envelope, later errors use an `event: error` frame. Completion stores assistant content; interruption/failure is not represented as successful completion. Client abort cancels upstream when supported.

## Provider and limits
Server calls `https://openrouter.ai/api/v1/chat/completions` with `stream: true`, model exactly `openai/gpt-4o-mini`, and server-only `OPENROUTER_API_KEY`. Set explicit timeout, output token ceiling, body size cap, and per-user/IP rate limit. Do not retry a non-idempotent generation automatically. Normalize provider errors without exposing raw response/secrets.

## Environment
Required for full runtime: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `OPENROUTER_API_KEY`. OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`. Optional: `NEXT_PUBLIC_APP_URL`, `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME`, rate-limit storage configuration. Production trusted origin and Better Auth URL must match deployed HTTPS origin.

## OAuth callbacks
For Better Auth default provider callback routes, configure Google and GitHub redirect URI as `https://<host>/api/auth/callback/google` and `https://<host>/api/auth/callback/github`; for local development use `http://localhost:3000/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/github`. Confirm actual configured base path with Better Auth deployment settings.

## Failure handling
Database failure before user message persistence: do not call provider and return 503. Provider error after user save: retain user turn and mark generation failed when possible. Completion persistence failure: terminate stream as failure and log sanitized correlation ID; never report a completed saved response. Stream interruption should be recorded as interrupted when possible. Search errors return 503 without partial results.
