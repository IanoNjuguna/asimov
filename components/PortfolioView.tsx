"use client";

import { useCallback, useEffect, useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { assertExecuted } from "@/lib/trade";
import { useWallet } from "@/lib/wallet";

type Position = {
  pubkey: string;
  marketId: string;
  isYes: boolean;
  contractsDecimal: string;
  totalCostUsd: string;
  valueUsd: string | null;
  payoutUsd: string;
  pnlUsd: string | null;
  pnlUsdPercent: number | null;
  claimable: boolean;
  claimed: boolean;
  marketMetadata?: { title?: string; status?: string; result?: string | null };
};

const usd = (micro: string | null) => (micro === null ? "—" : `$${(Number(micro) / 1e6).toFixed(2)}`);

// Sells move real USDC on mainnet, so they sit behind the same gate as buys.
const TRADING_ENABLED = process.env.NEXT_PUBLIC_ALLOW_TRADING === "true";

async function fetchPositions(owner: string): Promise<Position[]> {
  const res = await fetch(`/api/positions?owner=${owner}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Could not load positions.");
  return (body.positions ?? []) as Position[];
}

export function PortfolioView() {
  const { account, signTransaction } = useWallet();
  const [book, setBook] = useState<{ owner: string; items: Position[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!account) return;
    const owner = account.address;
    let alive = true;
    fetchPositions(owner)
      .then((items) => {
        if (alive) setBook({ owner, items });
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setBook({ owner, items: [] });
        setError(e instanceof Error ? e.message : "Could not load positions.");
      });
    return () => {
      alive = false;
    };
  }, [account]);

  const claim = useCallback(
    async (positionPubkey: string) => {
      if (!account) return;
      setBusy(positionPubkey);
      setError(null);
      try {
        const built = await fetch("/api/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ positionPubkey, ownerPubkey: account.address }),
        }).then((r) => r.json());
        if (built.error) throw new Error(built.error);

        const signed = await signTransaction(built.transaction);
        const landed = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedTransaction: signed }),
        }).then((r) => r.json());
        if (landed.error) throw new Error(landed.error);

        const owner = account.address;
        setBook({ owner, items: await fetchPositions(owner) });
      } catch (e) {
        setError(e instanceof Error ? e.message : "The claim did not go through.");
      } finally {
        setBusy(null);
      }
    },
    [account, signTransaction],
  );

  /** Signs a venue-built transaction and lands it through /api/execute. */
  const submit = useCallback(
    async (transaction: string, context: Record<string, unknown>) => {
      const signed = await signTransaction(transaction);
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedTransaction: signed, context }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "The venue rejected the submission.");
      return assertExecuted(body);
    },
    [signTransaction],
  );

  const exit = useCallback(
    async (positionPubkey: string) => {
      if (!account) return;
      setBusy(positionPubkey);
      setError(null);
      try {
        const built = await fetch("/api/sell", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ positionPubkey, ownerPubkey: account.address }),
        }).then((r) => r.json());
        if (built.error) throw new Error(built.error);

        await submit(built.transaction, built.context);

        const owner = account.address;
        setBook({ owner, items: await fetchPositions(owner) });
      } catch (e) {
        setError(e instanceof Error ? e.message : "The sell did not go through.");
      } finally {
        setBusy(null);
      }
    },
    [account, submit],
  );

  const closeAll = useCallback(async () => {
    if (!account) return;
    setBusy("all");
    setError(null);
    try {
      const built = await fetch("/api/close-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerPubkey: account.address, slippageBps: 2500 }),
      }).then((r) => r.json());
      if (built.error) throw new Error(built.error);

      const sells = (built.sells ?? []) as { transaction: string; context: Record<string, unknown> }[];
      if (!sells.length) throw new Error("Nothing to close.");

      // One signed transaction per position: a failure on one must not hide the rest.
      const failed: string[] = [];
      for (const sell of sells) {
        try {
          await submit(sell.transaction, sell.context);
        } catch (e) {
          failed.push(e instanceof Error ? e.message : "unknown");
        }
      }

      const owner = account.address;
      setBook({ owner, items: await fetchPositions(owner) });
      if (failed.length) {
        setError(`${failed.length} of ${sells.length} sells failed: ${failed[0]}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Close all did not go through.");
    } finally {
      setBusy(null);
    }
  }, [account, submit]);

  if (!account) {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <p className="text-[14px] font-medium text-ink">No wallet connected</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Connect a wallet holding USDC and your positions, cost basis and P&amp;L appear here.
          Positions pay $1 per contract when the market settles.
        </p>
        <div className="mt-4">
          <ConnectButton />
        </div>
      </div>
    );
  }

  const positions = book?.owner === account.address ? book.items : null;
  if (positions === null) {
    return <p className="mt-6 text-[13px] text-muted">Loading positions.</p>;
  }

  const open = positions.filter((p) => !p.claimed);
  const cost = open.reduce((sum, p) => sum + Number(p.totalCostUsd ?? 0), 0);
  const value = open.reduce((sum, p) => sum + Number(p.valueUsd ?? 0), 0);
  const pnl = open.reduce((sum, p) => sum + Number(p.pnlUsd ?? 0), 0);

  return (
    <div className="mt-4">
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-dim">Cost</p>
            <p className="tnum mt-1 text-[15px] text-ink">{usd(String(cost))}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-dim">Value</p>
            <p className="tnum mt-1 text-[15px] text-ink">{usd(String(value))}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-dim">P&amp;L</p>
            <p className={`tnum mt-1 text-[15px] ${pnl >= 0 ? "text-yes" : "text-no"}`}>
              {pnl >= 0 ? "+" : ""}
              {usd(String(pnl))}
            </p>
          </div>
        </div>

        {open.length > 1 ? (
          <button
            type="button"
            onClick={() => void closeAll()}
            disabled={!TRADING_ENABLED || busy === "all"}
            className="mt-3 w-full rounded-lg border border-line py-2 text-[12px] font-medium text-muted disabled:opacity-40"
          >
            {busy === "all" ? "Closing" : `Close all ${open.length} positions`}
          </button>
        ) : null}

        {!TRADING_ENABLED ? (
          <p className="mt-2 text-center text-[11px] leading-relaxed text-dim">
            Selling is off in this build. Set NEXT_PUBLIC_ALLOW_TRADING=true to sign exits.
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 rounded-xl border border-no/40 bg-no/10 px-3 py-2 text-[12px] leading-relaxed text-no">
          {error}
        </p>
      ) : null}

      {positions.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
          <p className="text-[14px] font-medium text-ink">No positions yet</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            Open a market and place an order. Filled orders show up here within seconds.
          </p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {positions.map((p) => {
            const positive = Number(p.pnlUsd ?? 0) >= 0;
            return (
              <li key={p.pubkey} className="rounded-2xl border border-line bg-surface p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-ink">
                      {p.marketMetadata?.title ?? p.marketId}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      <span className={p.isYes ? "text-yes" : "text-no"}>
                        {p.isYes ? "YES" : "NO"}
                      </span>{" "}
                      · {Number(p.contractsDecimal).toFixed(2)} contracts
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`tnum text-[14px] ${positive ? "text-yes" : "text-no"}`}>
                      {positive ? "+" : ""}
                      {usd(p.pnlUsd)}
                    </p>
                    <p className="tnum mt-0.5 text-[11px] text-dim">
                      {p.pnlUsdPercent === null ? "—" : `${p.pnlUsdPercent.toFixed(1)}%`}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-dim">
                  <span className="tnum">
                    cost {usd(p.totalCostUsd)} · value {usd(p.valueUsd)} · pays{" "}
                    {usd(p.payoutUsd)}
                  </span>
                  <span className="tnum">{p.marketMetadata?.status ?? ""}</span>
                </div>

                {p.claimable && !p.claimed ? (
                  <button
                    type="button"
                    onClick={() => void claim(p.pubkey)}
                    disabled={busy === p.pubkey}
                    className="mt-2.5 w-full rounded-lg bg-yes/15 py-2 text-[13px] font-semibold text-yes disabled:opacity-50"
                  >
                    {busy === p.pubkey ? "Claiming" : `Claim ${usd(p.payoutUsd)}`}
                  </button>
                ) : null}

                {!p.claimable && !p.claimed ? (
                  <button
                    type="button"
                    onClick={() => void exit(p.pubkey)}
                    disabled={!TRADING_ENABLED || busy === p.pubkey}
                    className="mt-2.5 w-full rounded-lg border border-line py-2 text-[13px] font-medium text-muted disabled:opacity-40"
                  >
                    {busy === p.pubkey
                      ? "Selling"
                      : `Exit ${Number(p.contractsDecimal).toFixed(2)} contracts`}
                  </button>
                ) : null}

                {p.claimed ? (
                  <p className="mt-2 text-[11px] text-dim">Payout claimed.</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
