/** Jupiter quotes prices in micro USD: 620000 = $0.62. */
export const micro = (n: number | string | null | undefined): number =>
  Number(n ?? 0) / 1e6;

/** 0.62 -> "62" */
export const pct = (priceMicro: number): string => (priceMicro / 1e6 * 100).toFixed(0);

/** 0.047 -> "4.7¢" */
export const cents = (priceMicro: number): string => {
  const c = priceMicro / 1e6 * 100;
  return `${c < 10 ? c.toFixed(1) : c.toFixed(0)}¢`;
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

export function closesIn(iso: string | null | undefined): string {
  if (!iso) return "";
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return "";
  if (ms <= 0) return "closed";
  const h = ms / 3_600_000;
  if (h < 1) return `${Math.max(1, Math.round(ms / 60_000))}m`;
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}
