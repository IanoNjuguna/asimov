"use client";

import { useCallback, useMemo, useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { cents, contractsFor, payoutFor, profitFor } from "@/lib/format";
import { assertExecuted } from "@/lib/trade";
import { useWallet } from "@/lib/wallet";

// Signing for real only when the build says so: the venue is mainnet and the
// deposit is real USDC.
const TRADING_ENABLED = process.env.NEXT_PUBLIC_ALLOW_TRADING === "true";
const MIN_STAKE = 5;

type Phase = "idle" | "building" | "confirm" | "signing" | "placed";

type Built = {
  transaction: string;
  context: Record<string, unknown>;
  orderPubkey: string | null;
  contracts: string;
  costUsd: string;
  feeUsd: string;
};

const usd = (micro: string | undefined) => `$${(Number(micro ?? 0) / 1e6).toFixed(2)}`;

export function TradePanel({
  marketId,
  yesPrice,
  noPrice,
}: {
  marketId: string;
  yesPrice: number;
  noPrice: number;
}) {
  const { wallets, account, connect, signTransaction } = useWallet();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [stake, setStake] = useState("5");
  const [phase, setPhase] = useState<Phase>("idle");
  const [built, setBuilt] = useState<Built | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const price = side === "yes" ? yesPrice : noPrice;
  const amount = Number.parseFloat(stake) || 0;
  const valid = amount >= MIN_STAKE;

  const { contracts, payout, profit } = useMemo(
    () => ({
      contracts: contractsFor(amount, price),
      payout: payoutFor(amount, price),
      profit: profitFor(amount, price),
    }),
    [amount, price],
  );

  const review = useCallback(async () => {
    if (!account) return;
    setPhase("building");
    setMessage(null);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerPubkey: account.address, marketId, side, amountUsd: amount }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error ?? "Could not build the order.");
      setBuilt({
        transaction: order.transaction,
        context: order.context,
        orderPubkey: order.orderPubkey ?? null,
        contracts: order.contracts,
        costUsd: order.costUsd,
        feeUsd: order.feeUsd,
      });
      setPhase("confirm");
    } catch (e) {
      setPhase("idle");
      setMessage(e instanceof Error ? e.message : "Could not build the order.");
    }
  }, [account, amount, marketId, side]);

  const place = useCallback(async () => {
    if (!built) return;
    setPhase("signing");
    setMessage("Waiting for your wallet to sign.");

    try {
      const signed = await signTransaction(built.transaction);
      setMessage("Submitting the signed order.");
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedTransaction: signed, context: built.context }),
      });
      const executed = await res.json();
      if (!res.ok) throw new Error(executed.error ?? "Jupiter rejected the submission.");
      const signature = assertExecuted(executed);

      setPhase("placed");
      setMessage(
        signature
          ? `With the keeper network. Signature ${signature.slice(0, 12)}…`
          : "With the keeper network. The position appears once a keeper fills it.",
      );

      if (built.orderPubkey) {
        for (let i = 0; i < 5; i += 1) {
          await new Promise((r) => setTimeout(r, 2500));
          const statusRes = await fetch(`/api/order-status?order=${built.orderPubkey}`);
          if (!statusRes.ok) break;
          const status = await statusRes.json();
          if (status?.status === "filled") {
            setMessage("Filled. The position is in your portfolio.");
            break;
          }
          if (status?.status === "failed") {
            setMessage("The keeper could not fill at your price. Nothing was taken.");
            break;
          }
        }
      }
    } catch (e) {
      setPhase("confirm");
      setMessage(e instanceof Error ? e.message : "The order did not go through.");
    }
  }, [built, signTransaction]);

  const primaryLabel = !valid
    ? `Minimum $${MIN_STAKE}`
    : !account
      ? "Connect wallet to trade"
      : phase === "building"
        ? "Building"
        : phase === "placed"
          ? "Order placed"
          : "Review order";

  return (
    <section className="mx-4 mt-5 rounded-2xl border border-line bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-dim">Trade</span>
        <ConnectButton />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(["yes", "no"] as const).map((s) => {
          const on = s === side;
          const p = s === "yes" ? yesPrice : noPrice;
          return (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSide(s);
                setPhase("idle");
                setBuilt(null);
              }}
              className={[
                "flex items-center justify-between rounded-xl border px-3 py-2.5 transition-colors",
                on
                  ? s === "yes"
                    ? "border-yes/60 bg-yes/10"
                    : "border-no/60 bg-no/10"
                  : "border-line bg-canvas",
              ].join(" ")}
            >
              <span
                className={[
                  "text-[13px] font-semibold uppercase tracking-wide",
                  on ? (s === "yes" ? "text-yes" : "text-no") : "text-muted",
                ].join(" ")}
              >
                {s}
              </span>
              <span className="tnum text-[15px] font-medium text-ink">{cents(p)}</span>
            </button>
          );
        })}
      </div>

      <label className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-canvas px-3 py-3">
        <span className="text-[13px] text-muted">Stake</span>
        <span className="text-[15px] text-dim">$</span>
        <input
          value={stake}
          onChange={(e) => {
            setStake(e.target.value.replace(/[^0-9.]/g, ""));
            setPhase("idle");
            setBuilt(null);
          }}
          inputMode="decimal"
          className="tnum min-w-0 flex-1 bg-transparent text-[19px] font-medium text-ink outline-none placeholder:text-dim"
          placeholder="5"
        />
        <span className="text-[11px] text-dim">USDC</span>
      </label>

      <dl className="mt-3 space-y-1.5 px-1 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-muted">Contracts</dt>
          <dd className="tnum text-ink">{contracts.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Payout if {side.toUpperCase()}</dt>
          <dd className="tnum text-ink">${payout.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Profit</dt>
          <dd className="tnum text-yes">+${profit.toFixed(2)}</dd>
        </div>
      </dl>

      {phase === "confirm" && built ? (
        <div className="mt-3 rounded-xl border border-line bg-canvas p-3 text-[13px]">
          <div className="flex justify-between">
            <span className="text-muted">Order</span>
            <span className="text-ink">
              {side.toUpperCase()} · {built.contracts} contracts
            </span>
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-muted">Cost plus fees</span>
            <span className="tnum text-ink">
              {usd(built.costUsd)} + {usd(built.feeUsd)}
            </span>
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-muted">Network</span>
            <span className="text-ink">Solana mainnet · USDC</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setPhase("idle");
                setBuilt(null);
                setMessage(null);
              }}
              className="flex-1 rounded-lg border border-line py-2 text-[13px] text-muted"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!TRADING_ENABLED}
              onClick={() => void place()}
              className="flex-[2] rounded-lg bg-ink py-2 text-[13px] font-semibold text-canvas disabled:opacity-40"
            >
              {TRADING_ENABLED ? "Sign and place" : "Trading disabled"}
            </button>
          </div>
          {!TRADING_ENABLED ? (
            <p className="mt-2 text-[11px] leading-relaxed text-dim">
              The order was built and priced; signing is gated behind
              NEXT_PUBLIC_ALLOW_TRADING=true because this deposit is real USDC on mainnet.
            </p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          disabled={!valid || phase === "building" || phase === "signing" || phase === "placed"}
          onClick={() => {
            if (!account) {
              const first = wallets[0];
              if (first) void connect(first).catch((e: unknown) => {
                setMessage(e instanceof Error ? e.message : "Could not connect.");
              });
              return;
            }
            void review();
          }}
          className="mt-3 w-full rounded-xl bg-ink py-3 text-[15px] font-semibold text-canvas disabled:opacity-40"
        >
          {primaryLabel}
        </button>
      )}

      <p className="mt-2 text-center text-[11px] leading-relaxed text-dim">
        {message ??
          "Fees apply on executed trades only. Positions pay $1 per contract at settlement."}
      </p>
    </section>
  );
}
