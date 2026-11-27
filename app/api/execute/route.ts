import { NextResponse } from "next/server";
import { fail, readJson, upstream } from "@/lib/api";
import { executeOrder } from "@/lib/jup";

// Submits the wallet-signed order. context is the opaque object from /api/order,
// passed back unchanged: Jupiter keys the submission off it.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("Send a JSON body.");

  const { signedTransaction, context } = body;
  if (typeof signedTransaction !== "string" || !signedTransaction) {
    return fail("signedTransaction is required.");
  }
  if (!context || typeof context !== "object") return fail("context is required.");

  try {
    const result = await executeOrder({
      signedTransaction,
      context: context as Record<string, unknown>,
    });
    return NextResponse.json(result);
  } catch (e) {
    return upstream(e);
  }
}
