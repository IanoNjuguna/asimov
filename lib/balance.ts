"use client";

// The panel cannot be honest about "Max" without the wallet's own balance.

import { useEffect, useState } from "react";
import { POSITIONS_CHANGED } from "@/lib/positions";
import { useWallet } from "@/lib/wallet";

export type Balances = { tokens: string; sol: number };

export function useBalances(): Balances | null {
  const { account } = useWallet();
  const [state, setState] = useState<{ owner: string; balances: Balances } | null>(null);

  useEffect(() => {
    if (!account) return;
    const owner = account.address;
    let alive = true;

    const load = () => {
      fetch(`/api/balance?owner=${owner}`)
        .then((r) => r.json())
        .then((body) => {
          if (!alive || body.error) return;
          setState({ owner, balances: { tokens: String(body.tokens ?? "0"), sol: Number(body.sol ?? 0) } });
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

  return state && account && state.owner === account.address ? state.balances : null;
}
