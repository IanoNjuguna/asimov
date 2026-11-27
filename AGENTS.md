# asimov

A Solana app built for the Dev3pack Global Hackathon, 27-29 Nov 2026 (hybrid, Nairobi build station).

## The brief

Asimov is a mobile-first view of live prediction markets on Solana, sold on one idea: a market price
is a probability, and the app makes that legible one-handed. Feed, market, trade, portfolio.

- No contracts. It is a client over Jupiter's Prediction Market API (`api.jup.ag/prediction/v1`),
  which aggregates Polymarket markets onto Solana and settles USDC from a $5 minimum.
- The edge is presentation and speed to market, not a new primitive.
- `JUP_API_KEY` is optional. Keyless upstream allows 0.5 req/s, so `lib/jup.ts` serialises calls and
  memoises results; with a key from portal.jup.ag the same code runs fast. A demo without a key is
  visibly slow, which is the only reason to bother.
- Trading is IP-blocked by the venue for the US and South Korea. The About screen says so.
- Never rsync a `create-next-app` scaffold over this directory: it overwrites this file.

## Facts about the event

- Three days. Judged at the end of 29 Nov.
- Solana only. Sponsor line-up includes Solana Mobile (Seeker), ElevenLabs, Firecrawl, Supabase.
- Student teams, online or at a build station. $10k+ cash plus local tracks.

## Skills

`.agents/skills/` is canonical: 74 skills, plain markdown, no build step. Hermes loads them when a
session starts inside this repo (the repo is in `skills.trusted_project_dirs`); other agents read
the directory directly. `skills-lock.json` records where each came from.

- `colosseum-copilot` and `colosseum-resources`: Solana project research, competitor history, sponsor
  tooling. Reach for these first when scoping or choosing an SDK.
- Design and UI craft: `design`, `ui-ux-pro-max`, `ui-styling`, `design-taste-frontend`, `impeccable`,
  `prototype`, `mobile-native`, `landing-page-design`.
- Process: `feature-process`, `humanise-text`, `thermo-nuclear-code-quality-review`, `skill-gardening`
  (owner of keeping these skills accurate), `check-compiler-errors`, `fix-merge-conflicts`.
- Carried over from a different chain and irrelevant on Solana: `swap-integration`, `swap-planner`,
  `v4-*`, `permissioned-pools-*`, `viem-integration`, `lp-integration`, `liquidity-planner`,
  `configurator`, `deployer`, `dca-bot`, `copy-trade`, `index-bot`, `pay-with-*`. Delete when they get
  in the way.

## Working style

- Bun is the package manager: `bun install`, `bun run <script>`, `bun.lock` is committed. No pnpm or npm
  lockfiles.
- Small, logically grouped commits. No single big commit.
- One change per branch, and a branch per feature.
- Push is part of done, not a later step.
- No em dashes in prose that ships.
- Explain like the reader has ADHD: punchline first, one idea per line, no process narration.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
