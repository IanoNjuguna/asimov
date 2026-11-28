import { NextResponse } from "next/server";
import { fail, isPubkey, upstream } from "@/lib/api";
import { USDC_MINT } from "@/lib/jup";
import { getBalances } from "@/lib/rpc";

// Reading a wallet's own public balance is public information; no signature needed.
export async function GET(request: Request) {
  const owner = new URL(request.url).searchParams.get("owner");
  if (!isPubkey(owner)) return fail("owner is not a Solana address.");

  try {
    const balances = await getBalances(owner, USDC_MINT);
    return NextResponse.json(balances);
  } catch (e) {
    return upstream(e);
  }
}
