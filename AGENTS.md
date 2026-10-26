# Project Rules for Coding Agents

## Sources of truth
Read `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, and `IMPLEMENTATION_PLAN.md` before feature work. Keep them consistent. Do not introduce unapproved product features or change the fixed model `openai/gpt-4o-mini`.

## Code quality
- TypeScript strict mode; avoid `any`; use clear domain names and small focused modules.
- Follow Next.js App Router conventions and keep secrets/provider/database code server-only.
- Reuse components/utilities; maintain accessible labels, keyboard behavior, focus visibility and responsive layouts.
- Validate external inputs with Zod. Enforce ownership at server query boundaries using verified Better Auth sessions.
- Never trust client user IDs, log credentials/session tokens, or expose provider raw errors.
- Escape/render Markdown safely; raw HTML remains disabled.

## Dependencies and configuration
Use npm and the approved stack. Add a dependency only when it materially serves an approved requirement. Keep lockfile current. Environment variables are parsed/validated and documented; commit `.env.example` with placeholders only, never `.env` or real credentials.

## Data and migrations
Drizzle is the only application ORM. Keep schema and migration history aligned. Review SQL. Never run destructive operations against production. Scope every data operation to owner.

## Tests and checks
Add focused tests for changed security-sensitive and core behavior. Run relevant tests, lint/type checks, and build when dependencies and configuration allow. Report checks accurately; distinguish unavailable credentials/services from verified behavior.

## Git and documentation
Inspect changes before editing, keep scope focused, do not discard user changes, and do not commit unless asked. Update source documents when an approved architectural or API behavior changes.
