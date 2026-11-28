"use client";

// Shared by the portfolio screen and the tab bar badge, so both read the same book
// and one refresh reaches both.

import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet";

export type Position = {
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

/** Fired after any action that changes the book, so the badge can follow along. */
export const POSITIONS_CHANGED = "asimov:positions-changed";

export function notifyPositionsChanged(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(POSITIONS_CHANGED));
}

export async function fetchPositions(owner: string): Promise<Position[]> {
  const res = await fetch(`/api/positions?owner=${owner}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Could not load positions.");
  return (body.positions ?? []) as Position[];
}

/**
 * Open exposure for the chrome. Refreshes on focus and whenever a screen reports a
 * change, which is what makes an asynchronous fill visible without polling.
 */
export function useOpenPositionCount(): number {
  const { account } = useWallet();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!account) return;
    const owner = account.address;
    let alive = true;

    const load = () => {
      fetchPositions(owner)
        .then((items) => {
          if (!alive) return;
          setCount(items.filter((p) => !p.claimed).length);
        })
        .catch(() => undefined);
    };

    load();
    window.addEventListener("focus", load);
    window.addEventListener(POSITIONS_CHANGED, load);
    return () => {
      alive = false;
      window.removeEventListener("focus", load);
      window.removeEventListener(POSITIONS_CHANGED, load);
    };
  }, [account]);

  return account ? count : 0;
}
