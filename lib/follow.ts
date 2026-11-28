"use client";

// A watchlist with no account and no backend: the list lives in localStorage and a
// module-level store keeps every subscriber in step without an effect.

import { useSyncExternalStore } from "react";

export type Followed = {
  marketId: string;
  /** The outcome, e.g. "60,000-62,000". */
  title: string;
  /** The question, e.g. "Bitcoin price on November 28?". */
  eventTitle: string;
  addedAt: number;
};

export const FOLLOW_KEY = "asimov:following";
export const FOLLOW_LIMIT = 24;

const EMPTY: readonly Followed[] = Object.freeze([]);

/** Anything can be in storage; only take entries that can render. */
export function parseFollowing(raw: string | null): Followed[] {
  if (!raw) return EMPTY.slice();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY.slice();
  }
  if (!Array.isArray(parsed)) return EMPTY.slice();

  const seen = new Set<string>();
  const out: Followed[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const { marketId, title, eventTitle, addedAt } = item as Record<string, unknown>;
    if (typeof marketId !== "string" || !marketId) continue;
    if (seen.has(marketId)) continue;
    seen.add(marketId);
    out.push({
      marketId,
      title: typeof title === "string" ? title : "",
      eventTitle: typeof eventTitle === "string" ? eventTitle : "",
      addedAt: typeof addedAt === "number" ? addedAt : 0,
    });
    if (out.length >= FOLLOW_LIMIT) break;
  }
  return out;
}

/** Add if absent, drop if present. Newest first. */
export function toggleFollowing(list: readonly Followed[], entry: Followed): Followed[] {
  if (list.some((f) => f.marketId === entry.marketId)) {
    return list.filter((f) => f.marketId !== entry.marketId);
  }
  return [entry, ...list].slice(0, FOLLOW_LIMIT);
}

export const serializeFollowing = (list: readonly Followed[]): string => JSON.stringify(list);

let state: Followed[] | null = null;
const listeners = new Set<() => void>();

const hydrate = (): Followed[] => {
  if (state) return state;
  state = typeof window === "undefined" ? [] : parseFollowing(window.localStorage.getItem(FOLLOW_KEY));
  return state;
};

const commit = (next: Followed[]) => {
  state = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(FOLLOW_KEY, serializeFollowing(next));
  }
  listeners.forEach((fn) => fn());
};

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  // Another tab editing the list must not be silently ignored.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== FOLLOW_KEY) return;
    state = parseFollowing(e.newValue);
    fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
};

const getSnapshot = (): readonly Followed[] => hydrate();

export function toggleFollow(entry: Followed): void {
  commit(toggleFollowing(hydrate(), entry));
}

export function useFollowing(): readonly Followed[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
