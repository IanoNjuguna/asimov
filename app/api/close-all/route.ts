import { NextResponse } from "next/server";
import { fail, isPubkey, readJson, upstream } from "@/lib/api";
import { buildCloseAll } from "@/lib/jup";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("Send a JSON body.");

  const { ownerPubkey, slippageBps } = body;
  if (!isPubkey(ownerPubkey)) return fail("ownerPubkey is not a Solana address.");

  const bps = typeof slippageBps === "number" ? slippageBps : Number.parseInt(String(slippageBps ?? 2500), 10);
  if (!Number.isFinite(bps) || bps < 0 || bps > 5000) {
    return fail("slippageBps must be between 0 and 5000.");
  }

  try {
    const all = await buildCloseAll(ownerPubkey, bps);
    const sells = (all.data ?? [])
      .filter((s) => s.transaction && s.execution?.context)
      .map((s) => ({
        transaction: s.transaction,
        context: s.execution.context,
        positionPubkey: s.order.positionPubkey,
        contracts: s.order.contractsDecimal,
      }));

    if (!sells.length) return fail("Nothing to close: no open positions on this wallet.", 404);
    return NextResponse.json({ sells });
  } catch (e) {
    return upstream(e);
  }
}
