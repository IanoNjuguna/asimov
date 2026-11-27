# Asimov

Prediction markets on Solana, built for one-handed reading. A price is a probability.

Live events come from Jupiter's Prediction Market API, which aggregates Polymarket markets onto
Solana. No contracts in this repo: the wallet signs, Jupiter's keepers fill, the venue settles.

## Run it

```bash
bun install
cp .env.example .env.local      # optional: API key, RPC, trading gate
bun run dev
```

Open http://localhost:3000.

`JUP_API_KEY` comes from portal.jup.ag and is optional for reads. Without it, requests go keyless at
0.5 req/s, so `lib/jup.ts` serialises every upstream call and memoises responses briefly. A market
screen costs three calls, which is about seven seconds keyless and instant with a key. Trading calls
are the exception: they want a key.

## Trading

The wallet is Wallet Standard, no vendor SDK. `solana:signTransaction` signs the transaction Jupiter
builds, and the signed bytes go back to the server to be submitted.

```
POST /api/order    ownerPubkey, marketId, side, amountUsd  -> unsigned tx + execution context
wallet             solana:signTransaction                  -> signed tx
POST /api/execute  signedTransaction, context              -> keeper network
GET  /api/order-status?order=<orderPubkey>                 -> pending | filled | failed
```

Three things worth knowing before you touch this:

- **The deposit is real USDC on mainnet.** There is no devnet for this venue, because the underlying
  markets are Polymarket's. Signing is therefore gated behind `NEXT_PUBLIC_ALLOW_TRADING=true`; with
  the gate off the app still builds and prices the order, then says why it will not sign.
- **The API key never reaches the browser.** Every Jupiter call that needs it happens in a route
  handler under `app/api/`.
- **An order account is not a fill.** The signed transaction only opens the order; Jupiter's keepers
  match it afterwards, so the UI polls the order status and the position shows up later.

Claims are different: Jupiter returns no execution context for them, so they are landed through
`SOLANA_RPC_URL` via `POST /api/submit`.

## Exiting

```
POST /api/sell       positionPubkey, ownerPubkey          -> unsigned sell + execution context
POST /api/close-all  ownerPubkey, slippageBps             -> one unsigned sell per open position
```

Both build through `DELETE /prediction/v1/positions`, so a sell is landed by the same
`POST /api/execute` as a buy. Closing all signs one transaction per position and reports which ones
failed rather than stopping at the first.

There is no separate cancel for a pending order: the Prediction API publishes no cancel endpoint, so
abandoning one means closing the position.

## Shape

| Path | What it does |
| --- | --- |
| `app/page.tsx` | Feed, filterable by category, sorted by the venue's trending order |
| `app/m/[id]/page.tsx` | Market: price, spread, orderbook depth, payout math, resolution rules |
| `app/portfolio/page.tsx` | Positions, cost basis, P&L, claim |
| `app/about/page.tsx` | What the data is, what the app does not do, where trading is blocked |
| `app/api/*` | Key-holding proxy: order, execute, order status, positions, claim, submit |
| `lib/jup.ts` | Server-only API client: throttle, TTL cache, typed in micro USD |
| `lib/wallet.tsx` | Wallet Standard discovery, connect, sign |
| `lib/format.ts` | Micro USD to cents, contracts and payouts |
| `components/TradePanel.tsx` | Side, stake, review sheet, sign, poll for the fill |

## Gates

```bash
bun run verify   # typecheck, lint, build
```

## Known limits

- The API is beta. Screens read live data only, so an upstream failure shows a message instead of
  a stale list.
- Trading is blocked by the venue for United States and South Korea IP addresses.
- No market creation, no custody, no own liquidity. The app never touches user funds.
- Sell one position or all of them; there is no partial sell and no per-order cancel.
- Minimum order is $5, and this app caps a single order at $250.
