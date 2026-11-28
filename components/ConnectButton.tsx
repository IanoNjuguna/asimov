"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet";

const short = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`;

/** Any surface can ask for the picker instead of silently connecting the first wallet. */
export const WALLET_PICKER_EVENT = "asimov:open-wallet-picker";

export function openWalletPicker(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(WALLET_PICKER_EVENT));
}

export function ConnectButton() {
  const { wallets, wallet, account, connecting, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(WALLET_PICKER_EVENT, onOpen);
    return () => window.removeEventListener(WALLET_PICKER_EVENT, onOpen);
  }, []);

  if (account) {
    return (
      <button
        type="button"
        onClick={() => void disconnect()}
        className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] text-muted"
      >
        {wallet?.name} · {short(account.address)}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={connecting}
        className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink disabled:opacity-50"
      >
        {connecting ? "Connecting" : "Connect"}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-line bg-raised p-1 shadow-xl">
          {wallets.length ? (
            wallets.map((w) => (
              <button
                key={w.name}
                type="button"
                onClick={async () => {
                  setError(null);
                  try {
                    await connect(w);
                    setOpen(false);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Connection failed.");
                  }
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] text-ink hover:bg-surface"
              >
                {w.name}
              </button>
            ))
          ) : (
            <p className="px-2.5 py-2 text-[12px] leading-relaxed text-muted">
              No Solana wallet found. Install one, then reload.
            </p>
          )}
          {error ? <p className="px-2.5 py-2 text-[11px] text-no">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
