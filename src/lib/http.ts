import { NextResponse } from "next/server";

export function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function readJson(request: Request, maxBytes = 32_000) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes) throw new Error("REQUEST_TOO_LARGE");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new Error("REQUEST_TOO_LARGE");
  try { return JSON.parse(text) as unknown; } catch { throw new Error("INVALID_JSON"); }
}
