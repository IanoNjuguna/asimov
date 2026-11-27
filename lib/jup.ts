// Server-only Jupiter Prediction API client.
// Never import from a client component: the API key lives here.

const BASE = "https://api.jup.ag/prediction/v1";
const KEY = process.env.JUP_API_KEY;

// Keyless upstream allows 0.5 req/s. With a key the burst is fine.
const MIN_GAP_MS = KEY ? 100 : 2200;

export type JupMarket = {
  marketId: string;
  eventId: string;
  title: string;
  status: "open" | "closed" | "cancelled";
  result: "yes" | "no" | null;
  closeTime: number;
  rulesPrimary: string;
  pricing: {
    buyYesPriceUsd: number;
    sellYesPriceUsd: number;
    buyNoPriceUsd: number;
    sellNoPriceUsd: number;
  };
};

export type JupEvent = {
  eventId: string;
  category: string;
  subcategory: string | null;
  tags: string[];
  isActive: boolean;
  isLive: boolean;
  volumeUsd: string;
  volume24hr: string;
  metadata: {
    title: string;
    subtitle: string;
    slug: string;
    series: string;
    imageUrl: string;
    closeTime: string | null;
  };
  markets: JupMarket[];
};

export type Orderbook = {
  yes: [number, number][];
  no: [number, number][];
};

let queue: Promise<unknown> = Promise.resolve();
let lastAt = 0;

const memo = new Map<string, { at: number; value: unknown }>();

/** Small in-process TTL cache: keeps prices fresh while sparing the upstream limit. */
async function cached<T>(key: string, ttlMs: number, run: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await run();
  memo.set(key, { at: Date.now(), value });
  return value;
}

/** Serialises upstream calls so keyless deployments stay under the rate limit. */
function throttle<T>(run: () => Promise<T>): Promise<T> {
  const next = queue.then(async () => {
    const wait = Math.max(0, lastAt + MIN_GAP_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastAt = Date.now();
    return run();
  });
  queue = next.catch(() => undefined);
  return next;
}

async function jup<T>(path: string, ttlMs: number): Promise<T> {
  return cached(`jup:${path}`, ttlMs, () =>
    throttle(async () => {
      const res = await fetch(`${BASE}${path}`, {
        headers: KEY ? { "x-api-key": KEY } : undefined,
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(
          `jupiter ${path} -> ${res.status} ${await res.text().catch(() => "")}`.slice(0, 300),
        );
      }
      return (await res.json()) as T;
    }),
  );
}

export const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "crypto", label: "Crypto" },
  { key: "sports", label: "Sports" },
  { key: "politics", label: "Politics" },
  { key: "esports", label: "Esports" },
  { key: "culture", label: "Culture" },
  { key: "economics", label: "Economy" },
  { key: "tech", label: "Tech" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export async function getFeed(category: CategoryKey = "all"): Promise<JupEvent[]> {
  const params = new URLSearchParams({
    includeMarkets: "true",
    start: "0",
    end: "40",
    filter: "trending",
  });
  if (category !== "all") params.set("category", category);
  const data = await jup<{ data: JupEvent[] }>(`/events?${params}`, 20_000);
  return (data.data ?? []).filter((e) => e.markets?.length);
}

export async function getEvent(eventId: string): Promise<JupEvent> {
  return jup<JupEvent>(`/events/${eventId}`, 15_000);
}

export async function getMarket(marketId: string): Promise<JupMarket> {
  return jup<JupMarket>(`/markets/${marketId}`, 5_000);
}

export async function getOrderbook(marketId: string): Promise<Orderbook> {
  return jup<Orderbook>(`/orderbook/${marketId}`, 5_000);
}

export async function getTradingStatus(): Promise<{ trading_active: boolean }> {
  return jup<{ trading_active: boolean }>(`/trading-status`, 30_000);
}

/* ------------------------------------------------------------------ trading */
/* Everything below builds unsigned transactions or reads a wallet's book.    */

export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const JUPUSD_MINT = "JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD";

export type Execution = {
  endpoint: string;
  context: Record<string, unknown>;
};

export type BuiltOrder = {
  transaction: string;
  txMeta: { blockhash: string; lastValidBlockHeight: number };
  execution: Execution;
  requiredSigners?: string[];
  order: {
    orderPubkey: string | null;
    positionPubkey: string;
    userPubkey: string;
    marketId: string;
    isBuy: boolean;
    isYes: boolean;
    contractsMicro: string;
    contractsDecimal: string;
    orderCostUsd: string;
    estimatedTotalFeeUsd: string;
  };
};

export type JupPosition = {
  pubkey: string;
  ownerPubkey: string;
  marketId: string;
  isYes: boolean;
  contractsMicro: string;
  contractsDecimal: string;
  totalCostUsd: string;
  valueUsd: string | null;
  payoutUsd: string;
  pnlUsd: string | null;
  pnlUsdPercent: number | null;
  claimable: boolean;
  claimed: boolean;
  claimedUsd: string;
  marketMetadata?: { title?: string; status?: string; result?: string | null };
  eventMetadata?: { title?: string; category?: string };
};

export type JupOrderStatus = {
  status?: "pending" | "filled" | "failed";
  order?: { contractsMicro?: string; filledContracts?: string; status?: string };
};

/** POST with no cache: order builds and submissions must never be served stale. */
async function jupPost<T>(path: string, body: unknown): Promise<T> {
  return throttle(async () => {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(KEY ? { "x-api-key": KEY } : {}) },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`jupiter ${path} -> ${res.status} ${await res.text().catch(() => "")}`.slice(0, 300));
    }
    return (await res.json()) as T;
  });
}

export async function buildBuyOrder(input: {
  ownerPubkey: string;
  marketId: string;
  isYes: boolean;
  amountUsd: number;
  mint?: string;
}): Promise<BuiltOrder> {
  return jupPost<BuiltOrder>(`/orders`, {
    ownerPubkey: input.ownerPubkey,
    marketId: input.marketId,
    isYes: input.isYes,
    isBuy: true,
    depositAmount: String(Math.round(input.amountUsd * 1e6)),
    depositMint: input.mint ?? USDC_MINT,
  });
}

export async function executeOrder(input: {
  signedTransaction: string;
  context: Record<string, unknown>;
}): Promise<Record<string, unknown>> {
  return jupPost<Record<string, unknown>>(`/execute`, input);
}

export async function getPositions(ownerPubkey: string): Promise<JupPosition[]> {
  const data = await jup<{ data: JupPosition[] }>(
    `/positions?${new URLSearchParams({ ownerPubkey })}`,
    5_000,
  );
  return data.data ?? [];
}

export async function getOrderStatus(orderPubkey: string): Promise<JupOrderStatus> {
  return jup<JupOrderStatus>(`/orders/status/${orderPubkey}`, 0);
}

export async function buildClaim(positionPubkey: string, ownerPubkey: string) {
  return jupPost<{ transaction: string; position?: { payoutAmountUsd?: string } }>(
    `/positions/${positionPubkey}/claim`,
    { ownerPubkey },
  );
}

