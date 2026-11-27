# asimov

A Solana app built for the Dev3pack Global Hackathon, 27-29 Nov 2026 (hybrid, Nairobi build station).

Product surface is still open. This file holds the process and the skills; the brief lands here once
the idea is picked.

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

- Small, logically grouped commits. No single big commit.
- One change per branch, and a branch per feature.
- Push is part of done, not a later step.
- No em dashes in prose that ships.
- Explain like the reader has ADHD: punchline first, one idea per line, no process narration.
