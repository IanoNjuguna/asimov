"use client";

import { useMemo, useState } from "react";
import { contractsFor, payoutFor, profitFor } from "@/lib/format";

export function TradePanel({
  yesPrice,
  noPrice,
}: {
  yesPrice: number;
  noPrice: number;
}) {
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [stake, setStake] = useState("5");

  const price = side === "yes" ? yesPrice : noPrice;
  const amount = Number.parseFloat(stake) || 0;
  const valid = amount >= 5;

  const { contracts, payout, profit } = useMemo(
    () => ({
      contracts: contractsFor(amount, price),
      payout: payoutFor(amount, price),
      profit: profitFor(amount, price),
    }),
    [amount, price],
  );

  return (
    <section className="mx-4 mt-5 rounded-2xl border border-line bg-surface p-3">
      <div className="grid grid-cols-2 gap-2">
        {(["yes", "no"] as const).map((s) => {
          const on = s === side;
          const p = s === "yes" ? yesPrice : noPrice;
          const centsLabel = (p / 1e6 * 100).toFixed(0);
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              className={[
                "flex items-center justify-between rounded-xl border px-3 py-2.5 transition-colors",
                on
                  ? s === "yes"
                    ? "border-yes/60 bg-yes/10"
                    : "border-no/60 bg-no/10"
                  : "border-line bg-canvas",
              ].join(" ")}
            >
              <span className={["text-[13px] font-semibold uppercase tracking-wide", on ? (s === "yes" ? "text-yes" : "text-no") : "text-muted"].join(" ")}>
                {s}
              </span>
              <span className="tnum text-[15px] font-medium text-ink">{centsLabel}¢</span>
            </button>
          );
        })}
      </div>

      <label className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-canvas px-3 py-3">
        <span className="text-[13px] text-muted">Stake</span>
        <span className="text-[15px] text-dim">$</span>
        <input
          value={stake}
          onChange={(e) => setStake(e.target.value.replace(/[^0-9.]/g, ""))}
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

      <button
        type="button"
        disabled
        className="mt-3 w-full rounded-xl bg-ink py-3 text-[15px] font-semibold text-canvas disabled:opacity-40"
      >
        {valid ? "Connect wallet to trade" : "Minimum $5"}
      </button>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-dim">
        Fees apply on executed trades only. Positions pay $1 per contract at settlement.
      </p>
    </section>
  );
}
