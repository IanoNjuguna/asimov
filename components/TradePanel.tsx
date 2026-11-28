"use client";

import { useCallback, useMemo, useState } from "react";
import { ConnectButton, openWalletPicker } from "@/components/ConnectButton";
import { Tween } from "@/components/Tween";
import { useBalances } from "@/lib/balance";
import { cents, contractsFor, payoutFor, profitFor } from "@/lib/format";
import { assertExecuted } from "@/lib/trade";
import { useWallet } from "@/lib/wallet";

// Signing for real only when the build says so: the venue is mainnet and the
// deposit is real USDC.
const TRADING_ENABLED = process.env.NEXT_PUBLIC_ALLOW_TRADING === "true";
const MIN_STAKE = 5;
/** Mirrors the per-order cap enforced in /api/order. */
const MAX_STAKE = 250;
const QUICK_STAKES = [5, 10, 25] as const;

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
  status,
  yesPrice,
  noPrice,
}: {
  marketId: string;
  status: "open" | "closed" | "cancelled";
  yesPrice: number;
  noPrice: number;
}) {
  const { account, signTransaction } = useWallet();
  const balances = useBalances();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [stake, setStake] = useState("5");
  const [phase, setPhase] = useState<Phase>("idle");
  const [built, setBuilt] = useState<Built | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const price = side === "yes" ? yesPrice : noPrice;
  const amount = Number.parseFloat(stake) || 0;
  const balanceUsd = balances ? Number(balances.tokens) / 1e6 : null;
  const shortOfFunds = balanceUsd !== null && amount > balanceUsd + 1e-9;
  const valid = amount >= MIN_STAKE && !shortOfFunds;

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

  const primaryLabel = shortOfFunds
    ? `Balance is $${(balanceUsd ?? 0).toFixed(2)}`
    : !valid
      ? `Minimum $${MIN_STAKE}`
      : phase === "building"
        ? "Building"
        : phase === "placed"
          ? "Order placed"
          : "Review order";

  // A closed market still renders the panel: the price is real history, the controls are not.
  if (status !== "open") {
    return (
      <section className="mx-4 mt-5 rounded-2xl border border-line bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.14em] text-dim">Trade</span>
          <ConnectButton />
        </div>
        <p className="rounded-xl border border-line bg-canvas px-3 py-3 text-[12px] leading-relaxed text-muted">
          {status === "cancelled" ? "This market was cancelled." : "This market has closed."} Positions
          already held can be exited or claimed from the portfolio.
        </p>
      </section>
    );
  }

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
                <span className="mr-1 text-[10px] font-normal normal-case tracking-normal text-dim">buy</span>
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

      {/* One tap sizing: the number a person actually says out loud. */}
      <div className="mt-2 flex items-center gap-1.5">
        {QUICK_STAKES.map((v) => {
          const on = Math.abs(amount - v) < 0.005;
          return (
            <button
              key={v}
              type="button"
              onClick={() => {
                setStake(String(v));
                setPhase("idle");
                setBuilt(null);
              }}
              className={[
                "rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-colors",
                on ? "border-ink text-ink" : "border-line text-muted active:bg-raised",
              ].join(" ")}
            >
              ${v}
            </button>
          );
        })}
        <button
          type="button"
          disabled={balanceUsd === null || balanceUsd < MIN_STAKE}
          onClick={() => {
            setStake(Math.min(balanceUsd ?? 0, MAX_STAKE).toFixed(2));
            setPhase("idle");
            setBuilt(null);
          }}
          className="rounded-lg border border-line px-2.5 py-1 text-[12px] font-medium text-muted disabled:opacity-40"
        >
          Max
        </button>
        <span className="tnum ml-auto text-[11px] text-dim">
          {balanceUsd === null ? "" : `Balance $${balanceUsd.toFixed(2)}`}
        </span>
      </div>

      <dl className="mt-3 space-y-1.5 px-1 text-[13px]">
        <div className="flex justify-between">
          <dt className="text-muted">Contracts</dt>
          <dd className="tnum text-ink">
            <Tween value={contracts} format={(n) => n.toFixed(2)} />
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Payout if {side.toUpperCase()}</dt>
          <dd className="tnum text-ink">
            $<Tween value={payout} format={(n) => n.toFixed(2)} />
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Profit</dt>
          <dd className={`tnum ${profit >= 0 ? "text-yes" : "text-no"}`}>
            {profit >= 0 ? "+" : "-"}$<Tween value={Math.abs(profit)} format={(n) => n.toFixed(2)} />
          </dd>
        </div>
      </dl>

      <button
        type="button"
        disabled={!valid || phase === "building" || phase === "signing" || phase === "placed"}
        onClick={() => {
          if (!account) {
            openWalletPicker();
            return;
          }
          void review();
        }}
        className="mt-3 w-full rounded-xl bg-ink py-3 text-[15px] font-semibold text-canvas disabled:opacity-40"
      >
        {primaryLabel}
      </button>

      <p className="mt-2 text-center text-[11px] leading-relaxed text-dim">
        {message ??
          "Fees apply on executed trades only. Positions pay $1 per contract at settlement."}
      </p>

      {(phase === "confirm" || phase === "signing" || phase === "placed") && built ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              if (phase === "signing") return;
              setPhase("idle");
              setBuilt(null);
            }}
            className="backdrop-in absolute inset-0 bg-canvas/70"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="sheet-in absolute inset-x-0 bottom-0 mx-auto max-w-[520px] rounded-t-2xl border-t border-line bg-surface px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />

            {phase === "placed" ? (
              <>
                <p className="text-[17px] font-semibold text-ink">Order placed</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{message}</p>
                <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-muted">{side.toUpperCase()} contracts</span>
                    <span className="tnum text-ink">{built.contracts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Paid</span>
                    <span className="tnum text-ink">
                      {usd(built.costUsd)} + {usd(built.feeUsd)} fee
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("idle");
                    setBuilt(null);
                  }}
                  className="mt-4 w-full rounded-lg bg-ink py-2.5 text-[14px] font-semibold text-canvas"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <p className="text-[17px] font-semibold text-ink">Review order</p>
                <div className="mt-3 space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-muted">Order</span>
                    <span className="text-ink">
                      {side.toUpperCase()} · {built.contracts} contracts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Cost plus fees</span>
                    <span className="tnum text-ink">
                      {usd(built.costUsd)} + {usd(built.feeUsd)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Network</span>
                    <span className="text-ink">Solana mainnet · USDC</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={phase === "signing"}
                    onClick={() => {
                      setPhase("idle");
                      setBuilt(null);
                      setMessage(null);
                    }}
                    className="flex-1 rounded-lg border border-line py-2.5 text-[13px] text-muted disabled:opacity-40"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!TRADING_ENABLED || phase === "signing"}
                    onClick={() => void place()}
                    className="flex-[2] rounded-lg bg-ink py-2.5 text-[13px] font-semibold text-canvas disabled:opacity-40"
                  >
                    {phase === "signing"
                      ? "Waiting for your wallet"
                      : TRADING_ENABLED
                        ? "Sign and place"
                        : "Trading disabled"}
                  </button>
                </div>

                {!TRADING_ENABLED ? (
                  <p className="mt-2 text-[11px] leading-relaxed text-dim">
                    The order was built and priced; signing is gated behind
                    NEXT_PUBLIC_ALLOW_TRADING=true because this deposit is real USDC on mainnet.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
