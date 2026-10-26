# Thinkora AI Product Requirements

## Product
Thinkora is a responsive, authenticated AI chat application. Users can hold persistent conversations with OpenRouter's `openai/gpt-4o-mini`, revisit and manage their history, and control basic appearance settings.

## Audience and outcomes
The MVP serves individual users who want a straightforward private AI chat workspace on desktop or mobile. Success means a user can sign in, start a conversation, receive a genuinely streamed answer, and return to the saved conversation later.

## MVP requirements
- Authentication: email/password, Google OAuth, and GitHub OAuth through Better Auth; sign out; server verified sessions.
- Chat: create conversation, submit a bounded text message, stream a provider response, persist user and completed assistant messages, load history, stop generation, and retry a failed assistant turn.
- Conversation management: list recent conversations, search titles and message text, rename, delete with confirmation, and display useful empty/loading/error states.
- Response actions: copy assistant text; render safe Markdown and code; expose readable streaming and failure states.
- Workspace: collapsible desktop sidebar, responsive mobile navigation, light/dark/system theme, and a small settings view.
- Security and reliability: ownership enforced on every conversation operation, server-side validation, secrets only on the server, request limits, provider/database error handling, and duplicate submission protection.

## User journeys
1. Visitor registers or signs in using email/password or a configured OAuth provider.
2. Authenticated user starts a new chat, submits a message, sees the actual OpenRouter stream, and can stop generation.
3. User returns to a prior chat, searches or renames it, copies a response, retries an eligible failed response, or deletes the conversation.
4. User changes theme and signs out.

## Permissions and data
Unauthenticated users may access public entry and sign-in pages only. An authenticated user may access only their own conversations and messages. User identity comes from the verified session, never a browser-supplied user ID. Stored content includes Better Auth identity/session records, conversation title/owner/timestamps, and ordered user/assistant messages with status and timestamps.

## Integrations
Better Auth; Google OAuth; GitHub OAuth; Neon PostgreSQL through Drizzle; OpenRouter using the fixed model `openai/gpt-4o-mini`; Vercel deployment. OAuth and service credentials are environment configuration.

## Error states
Invalid form or message; unauthenticated/expired session; unauthorized or missing conversation; rate limit; database unavailable; provider timeout, refusal, quota, or malformed response; interrupted/cancelled stream; clipboard unavailable; network loss. Show actionable, non-sensitive messages and do not imply an unsaved turn was persisted.

## Out of scope
Multi-user/shared conversations, file uploads, voice, model selection, billing, organization administration, and third-party integrations beyond the specified providers.

## Acceptance criteria
- Strictly typed Next.js App Router application builds successfully.
- Configured sign-in methods use Better Auth and protected server operations derive identity from the session.
- Users can create/read/search/rename/delete only their own conversations and messages.
- Chat requests call OpenRouter with exactly `openai/gpt-4o-mini`; response tokens stream to the browser and completed responses persist.
- Validation, rate/request bounds, stop/failure states, safe Markdown rendering, responsive layout, and theme setting are present.
- Required environment variables and callback URLs are documented; no secrets are committed.
- Critical journeys and production build are checked; unconfigured external services are reported as unverified rather than simulated.

## Assumptions and approvals
- Assumption: users must authenticate before any conversation can be created; no anonymous trial.
- Assumption: conversation search is per-user and searches title plus message content in PostgreSQL.
- Decision requiring owner configuration, not a product redesign: Neon, OpenRouter, OAuth, and production credentials/URLs must be supplied through deployment environment variables. Google Stitch was not present in the workspace or connected tools at initial inspection.
