import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";
import { env, requireEnv } from "@/lib/env";

export function getAuth() {
  return betterAuth({
    appName: "Thinkora AI",
    baseURL: requireEnv("BETTER_AUTH_URL"),
    secret: requireEnv("BETTER_AUTH_SECRET"),
    trustedOrigins: [env.NEXT_PUBLIC_APP_URL, env.BETTER_AUTH_URL].filter((x): x is string => !!x),
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: { enabled: true },
    socialProviders: {
      ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } } : {}),
      ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? { github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET } } : {}),
    },
    advanced: { useSecureCookies: process.env.NODE_ENV === "production" },
  });
}

export async function getSession(headers: Headers) {
  if (!env.BETTER_AUTH_SECRET || !env.BETTER_AUTH_URL || !env.DATABASE_URL) return null;
  return getAuth().api.getSession({ headers });
}
