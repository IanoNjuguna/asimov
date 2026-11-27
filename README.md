# Asimov

Prediction markets on Solana, built for one-handed reading. A price is a probability.

Live events come from Jupiter's Prediction Market API, which aggregates Polymarket markets onto
Solana. No contracts in this repo: the wallet signs, Jupiter's keepers fill, the venue settles.

## Run it

```bash
pnpm install
JUP_API_KEY=... pnpm dev   # the key is optional, see below
```

Open http://localhost:3000.

`JUP_API_KEY` comes from portal.jup.ag and is optional. Without it, requests go keyless at 0.5 req/s,
so `lib/jup.ts` serialises every upstream call and memoises responses briefly. A market screen costs
three calls, which is about seven seconds keyless and instant with a key.

## Shape

| Path | What it does |
| --- | --- |
| `app/page.tsx` | Feed, filterable by category, sorted by the venue's trending order |
| `app/m/[id]/page.tsx` | Market: price, spread, orderbook depth, payout math, resolution rules |
| `app/portfolio/page.tsx` | Positions, cost basis, P&amp;L, claim |
| `app/about/page.tsx` | What the data is, what the app does not do, where trading is blocked |
| `lib/jup.ts` | Server-only API client: throttle, TTL cache, typed in micro USD |
| `lib/format.ts` | Micro USD to cents, contracts and payouts |

## Gates

```bash
pnpm verify   # typecheck, lint, build
```

## Known limits

- The API is beta. Screens read live data only, so an upstream failure shows a message instead of
  a stale list.
- Trading is blocked by the venue for United States and South Korea IP addresses.
- No market creation, no custody, no own liquidity. The app never touches user funds.
