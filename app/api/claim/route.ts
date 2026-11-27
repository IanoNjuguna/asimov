import { NextResponse } from "next/server";
import { fail, isPubkey, readJson, upstream } from "@/lib/api";
import { buildClaim } from "@/lib/jup";

// Builds the unsigned payout transaction for a settled, winning position.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("Send a JSON body.");

  const { positionPubkey, ownerPubkey } = body;
  if (!isPubkey(positionPubkey)) return fail("positionPubkey is not a Solana address.");
  if (!isPubkey(ownerPubkey)) return fail("ownerPubkey is not a Solana address.");

  try {
    const claim = await buildClaim(positionPubkey, ownerPubkey);
    if (!claim.transaction) return fail("Jupiter built no claim transaction.", 502);
    return NextResponse.json({ transaction: claim.transaction, payoutUsd: claim.position?.payoutAmountUsd ?? "0" });
  } catch (e) {
    return upstream(e);
  }
}
