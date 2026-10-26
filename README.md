# Thinkora AI

Thinkora is a private, responsive AI chat workspace built with Next.js App Router, strict TypeScript, Tailwind CSS, Better Auth, Drizzle ORM, Neon PostgreSQL, and OpenRouter (`openai/gpt-4o-mini`).

## Local setup

1. Use Node.js 20+ and npm.
2. Copy `.env.example` to `.env.local` and fill in Neon, Better Auth, and OpenRouter values. Google/GitHub OAuth is enabled when both credentials for that provider are set.
3. Install dependencies with `npm install`.
4. Apply the initial migration using the configured Neon database: `npm run db:migrate`.
5. Start the app with `npm run dev`.
6. Verify changes with `npm run typecheck`, `npm run lint`, and `npm run build`.

OAuth callback URLs for local development are `http://localhost:3000/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/github`. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the HTTPS production origin on Vercel and configure matching callbacks at each provider.

## Deployment

Provision Neon PostgreSQL and configure all required environment variables in Vercel. Apply reviewed Drizzle migrations before routing traffic. Configure provider callbacks and Better Auth trusted origin for the deployed domain. The API route streams SSE from OpenRouter and is configured for a 120 second Vercel function duration. Keep secrets in the deployment environment, never in source control.

Monitoring and backups use Vercel runtime logs and the backup/recovery facilities configured for the Neon plan. Review sanitized provider failures and latency; do not log message content or secrets.

See `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `AGENTS.md`, and `IMPLEMENTATION_PLAN.md` for the product and implementation source of truth.
