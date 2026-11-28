/** Jupiter quotes prices in micro USD: 620000 = $0.62. */
export const micro = (n: number | string | null | undefined): number =>
  Number(n ?? 0) / 1e6;

/** 0.62 -> "62" */
export const pct = (priceMicro: number): string => (priceMicro / 1e6 * 100).toFixed(0);

/** 0.047 -> "4.7¢", 0.06 -> "6¢" */
export const cents = (priceMicro: number): string => {
  const c = priceMicro / 1e6 * 100;
  const s = c < 10 ? c.toFixed(1) : c.toFixed(0);
  return `${s.replace(/\.0$/, "")}¢`;
};

export const usd = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `$${n.toFixed(0)}`;
};

export const contractsFor = (stakeUsd: number, priceMicro: number): number =>
  priceMicro > 0 ? stakeUsd / (priceMicro / 1e6) : 0;

/** Payout at settlement for a stake: contracts * $1, i.e. stake / price. */
export const payoutFor = (stakeUsd: number, priceMicro: number): number =>
  contractsFor(stakeUsd, priceMicro);

export const profitFor = (stakeUsd: number, priceMicro: number): number =>
  payoutFor(stakeUsd, priceMicro) - stakeUsd;

/** Time to close, as a short label. `now` is passed in so the value is computed at request time and
 *  never baked into a prerender: Next's cacheComponents rejects a bare Date.now() during prerender. */
export function closesIn(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return "";
  const ms = new Date(iso).getTime() - now;
  if (Number.isNaN(ms)) return "";
  if (ms <= 0) return "closed";
  const h = ms / 3_600_000;
  if (h < 1) return `${Math.max(1, Math.round(ms / 60_000))}m`;
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

/** "closes in 2h", or just "closed": the bare value cannot be prefixed. */
export const closesLabel = (iso: string | null | undefined, now?: number): string => {
  const value = closesIn(iso, now);
  if (!value) return "";
  return value === "closed" ? "closed" : `closes ${value}`;
};
