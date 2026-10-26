import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export const env = serverSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL || undefined,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || undefined,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || undefined,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || undefined,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || undefined,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || undefined,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || undefined,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || undefined,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
});

export function requireEnv<K extends keyof typeof env>(key: K): NonNullable<(typeof env)[K]> {
  const value = env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value as NonNullable<(typeof env)[K]>;
}
