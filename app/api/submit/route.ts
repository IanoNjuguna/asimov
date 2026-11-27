import { NextResponse } from "next/server";
import { fail, readJson } from "@/lib/api";
import { submitSignedTransaction } from "@/lib/rpc";

// Generic landing route for transactions Jupiter hands back without an execution
// context, which is the case for claims.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("Send a JSON body.");

  const { signedTransaction } = body;
  if (typeof signedTransaction !== "string" || !signedTransaction) {
    return fail("signedTransaction is required.");
  }

  try {
    const signature = await submitSignedTransaction(signedTransaction);
    return NextResponse.json({ signature });
  } catch (e) {
    return fail(e instanceof Error ? e.message.slice(0, 240) : "Submission failed.", 502);
  }
}
