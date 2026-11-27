import { NextResponse } from "next/server";
import { fail, isPubkey, readJson, upstream } from "@/lib/api";
import { buildSell } from "@/lib/jup";

// Sells every contract of one position. The venue answers with the same
// transaction plus execution context shape as a buy, so /api/execute lands it.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("Send a JSON body.");

  const { positionPubkey, ownerPubkey } = body;
  if (!isPubkey(positionPubkey)) return fail("positionPubkey is not a Solana address.");
  if (!isPubkey(ownerPubkey)) return fail("ownerPubkey is not a Solana address.");

  try {
    const sell = await buildSell(positionPubkey, ownerPubkey);
    if (!sell.transaction || !sell.execution?.context) {
      return fail("Jupiter built no sell transaction for that position.", 502);
    }
    return NextResponse.json({
      transaction: sell.transaction,
      context: sell.execution.context,
      positionPubkey: sell.order.positionPubkey,
      contracts: sell.order.contractsDecimal,
      proceedsUsd: sell.order.orderCostUsd,
      feeUsd: sell.order.estimatedTotalFeeUsd,
    });
  } catch (e) {
    return upstream(e);
  }
}
