"use client";

// Wallet Standard only: no vendor SDK, no wallet-adapter packages. A wallet announces
// itself on window, we read standard:connect and solana:signTransaction off it.

import { getWallets } from "@wallet-standard/app";
import type { Wallet } from "@wallet-standard/base";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const SOLANA_MAINNET = "solana:mainnet";

export type WalletAccount = {
  address: string;
  chains: readonly string[];
  features: readonly string[];
  label?: string;
};

type ConnectFeature = {
  connect(input?: { silent?: boolean }): Promise<{ accounts: readonly WalletAccount[] }>;
};

type DisconnectFeature = {
  disconnect(): Promise<void>;
};

type SignTransactionFeature = {
  signTransaction(input: {
    transaction: Uint8Array;
    account: WalletAccount;
    chain: string;
  }): Promise<readonly { signedTransaction: Uint8Array }[]>;
};

function feature<T>(wallet: Wallet, name: string): T | undefined {
  const f = (wallet.features as Record<string, unknown>)[name];
  return f as T | undefined;
}

export const walletName = (wallet: Wallet): string => wallet.name;

export type WalletState = {
  wallets: readonly Wallet[];
  wallet: Wallet | null;
  account: WalletAccount | null;
  connecting: boolean;
  connect(wallet: Wallet): Promise<void>;
  disconnect(): Promise<void>;
  /** Signs a serialized transaction and returns it base64 again. */
  signTransaction(base64: string): Promise<string>;
};

const WalletContext = createContext<WalletState | null>(null);

const pickAccount = (accounts: readonly WalletAccount[]): WalletAccount | null => {
  const mainnet = accounts.find((a) => a.chains.includes(SOLANA_MAINNET));
  return mainnet ?? accounts[0] ?? null;
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<readonly Wallet[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const registry = getWallets();
    const sync = () => setWallets(registry.get());
    sync();
    const offRegister = registry.on("register", sync);
    const offUnregister = registry.on("unregister", sync);
    return () => {
      offRegister();
      offUnregister();
    };
  }, []);

  const connect = useCallback(async (target: Wallet) => {
    const connectFeature = feature<ConnectFeature>(target, "standard:connect");
    if (!connectFeature) throw new Error(`${target.name} cannot connect.`);
    setConnecting(true);
    try {
      const { accounts } = await connectFeature.connect();
      const next = pickAccount(accounts);
      if (!next) throw new Error(`${target.name} returned no Solana account.`);
      if (!next.chains.includes(SOLANA_MAINNET)) {
        throw new Error(`${target.name} does not expose ${SOLANA_MAINNET}.`);
      }
      setWallet(target);
      setAccount(next);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (wallet) {
      await feature<DisconnectFeature>(wallet, "standard:disconnect")?.disconnect().catch(() => undefined);
    }
    setWallet(null);
    setAccount(null);
  }, [wallet]);

  const signTransaction = useCallback(
    async (base64: string) => {
      if (!wallet || !account) throw new Error("Connect a wallet first.");
      const signer = feature<SignTransactionFeature>(wallet, "solana:signTransaction");
      if (!signer) throw new Error(`${wallet.name} cannot sign transactions.`);
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const [signed] = await signer.signTransaction({
        transaction: bytes,
        account,
        chain: SOLANA_MAINNET,
      });
      if (!signed?.signedTransaction) throw new Error("The wallet returned no signature.");
      return btoa(String.fromCharCode(...signed.signedTransaction));
    },
    [account, wallet],
  );

  const value = useMemo<WalletState>(
    () => ({ wallets, wallet, account, connecting, connect, disconnect, signTransaction }),
    [account, connect, connecting, disconnect, signTransaction, wallet, wallets],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider.");
  return value;
}
