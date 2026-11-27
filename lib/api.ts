import { NextResponse } from "next/server";

/** Base58 of a 32-byte key: 32 to 44 characters, no 0/O/I/l. */
const PUBKEY = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const isPubkey = (value: unknown): value is string =>
  typeof value === "string" && PUBKEY.test(value);

export const MIN_STAKE_USD = 5;
export const MAX_STAKE_USD = 250;

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Upstream failures carry their own text; pass it through, capped. */
export function upstream(e: unknown) {
  const message = e instanceof Error ? e.message : "Upstream request failed.";
  const status = /->\s*(401|403)/.test(message) ? 403 : 502;
  const hint =
    status === 403
      ? " Trading needs a Jupiter API key: set JUP_API_KEY on the server, from portal.jup.ag."
      : "";
  return fail(message.slice(0, 240) + hint, status);
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const body = await request.json().catch(() => null);
  return body && typeof body === "object" && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : null;
}
