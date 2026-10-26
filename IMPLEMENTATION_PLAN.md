# Thinkora AI Implementation Plan

## Phase 1 — Foundation and project setup
- Goal: runnable typed Next.js app with validated configuration and design primitives.
- Tasks: initialize App Router, strict TypeScript, Tailwind, shadcn-compatible UI setup, Lucide, Sonner, formatting/lint scripts, environment schema, base routes and app shell.
- Files: package/config files, `app/`, `components/ui/`, `lib/env.ts`, `.env.example`, `.gitignore`.
- Dependencies: none.
- DB/API changes: none.
- Checks: install, lint, typecheck, production build.
- Complete when app runs with no secrets and documented required configuration.

## Phase 2 — Database and authentication
- Goal: persisted identity and secure sessions.
- Tasks: Better Auth email/password and OAuth provider config, Drizzle schema/client, Neon migrations, sign-in/up UI, session helpers, protected route behavior.
- Files: `lib/auth/`, `lib/db/`, `app/api/auth/`, auth pages, migration files.
- Dependencies: Phase 1 and configured database/OAuth credentials.
- DB/API: Better Auth tables; auth handler.
- Checks: schema/migration review, auth tests, callbacks and unauthorized route checks when credentials exist.
- Complete when configured auth works and all protected server routes derive session identity.

## Phase 3 — Conversation persistence and management
- Goal: secure CRUD, search, history.
- Tasks: conversation/message schema and migrations, owner-scoped services, list/search/create/detail/rename/delete APIs, sidebar/history states.
- Files: `lib/db/schema.ts`, `lib/conversations/`, `app/api/conversations/`, chat shell/sidebar.
- Dependencies: Phase 2.
- DB/API: conversations/messages; CRUD/search routes.
- Checks: ownership isolation, CRUD, search and DB failure tests.
- Complete when users can manage only their own persisted conversations.

## Phase 4 — Real AI streaming
- Goal: actual OpenRouter stream persisted safely.
- Tasks: bounded Zod request, rate limit/idempotency, fixed-model provider adapter, stream UI, cancel/retry/failure states, safe persistence lifecycle.
- Files: `lib/ai/`, `lib/validation/`, message API, composer/transcript.
- Dependencies: Phase 3 and OpenRouter key.
- DB/API: generation/idempotency state; streaming message endpoint.
- Checks: provider success/failure, cancellation, duplicate, DB failure and stream persistence tests.
- Complete when real configured requests stream and only completed assistant responses are marked complete.

## Phase 5 — UX completion and accessibility
- Goal: finish required interaction and responsive states.
- Tasks: Markdown/code rendering, copy, retry, themes, settings, responsive sidebar/drawer, keyboard/screen-reader states, polish.
- Files: chat/settings components and styles.
- Dependencies: Phases 1–4.
- DB/API: none beyond existing APIs.
- Checks: keyboard/accessibility review, mobile viewport and theme checks.
- Complete when all PRD journeys have loading, empty, success and error states.

## Phase 6 — Security, deployment and release review
- Goal: verifiable Vercel-ready release configuration.
- Tasks: rate/body limits, security audit, deployment guide, migration procedure, production env checks, monitoring/recovery notes, final source-doc audit.
- Files: middleware/configuration as needed, deployment documentation, tests.
- Dependencies: Phases 1–5; provisioned external services.
- DB/API: production migration and origin config.
- Checks: complete test suite, production build, critical browser journeys, dependency/security review.
- Complete when every critical acceptance criterion is verified or clearly listed as a release blocker.

## Cross-document consistency decisions
1. All documents use one fixed OpenRouter model and authenticated-only conversations.
2. Conversations and messages are owner-scoped; assistant generation persists user input before provider calls and marks only completed output complete.
3. OAuth callback paths use Better Auth defaults and must be confirmed against deployed base path.
4. Stitch reference was unavailable, so DESIGN.md is an explicit baseline rather than a claim of reference fidelity.
