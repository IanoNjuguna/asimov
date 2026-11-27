import { NextResponse } from "next/server";
import { fail, isPubkey, MAX_STAKE_USD, MIN_STAKE_USD, readJson, upstream } from "@/lib/api";
import { buildBuyOrder, JUPUSD_MINT, USDC_MINT } from "@/lib/jup";

// The API key never reaches the browser, so every order is built here.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail("Send a JSON body.");

  const { ownerPubkey, marketId, side, amountUsd, mint } = body;
  if (!isPubkey(ownerPubkey)) return fail("ownerPubkey is not a Solana address.");
  if (typeof marketId !== "string" || !marketId.trim()) return fail("marketId is required.");
  if (side !== "yes" && side !== "no") return fail("side must be yes or no.");

  const amount = typeof amountUsd === "number" ? amountUsd : Number.parseFloat(String(amountUsd));
  if (!Number.isFinite(amount)) return fail("amountUsd is not a number.");
  if (amount < MIN_STAKE_USD) return fail(`Minimum order is $${MIN_STAKE_USD}.`);
  if (amount > MAX_STAKE_USD) return fail(`Per-order cap in this app is $${MAX_STAKE_USD}.`);

  const depositMint = mint === "JupUSD" ? JUPUSD_MINT : USDC_MINT;

  try {
    const order = await buildBuyOrder({
      ownerPubkey,
      marketId,
      isYes: side === "yes",
      amountUsd: amount,
      mint: depositMint,
    });
    if (!order.transaction || !order.execution?.context) {
      return fail("Jupiter built no transaction for that order.", 502);
    }
    return NextResponse.json({
      transaction: order.transaction,
      context: order.execution.context,
      orderPubkey: order.order.orderPubkey,
      positionPubkey: order.order.positionPubkey,
      contracts: order.order.contractsDecimal,
      costUsd: order.order.orderCostUsd,
      feeUsd: order.order.estimatedTotalFeeUsd,
    });
  } catch (e) {
    return upstream(e);
  }
}
