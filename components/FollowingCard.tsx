"use client";

import Link from "next/link";
import { pct } from "@/lib/format";
import { toggleFollow, useFollowing } from "@/lib/follow";
import type { JupEvent } from "@/lib/jup";

const MAX_ROWS = 5;

/**
 * The personal section above the feed. Live prices come from the same server payload
 * the list uses, so watching a market costs no extra request; a market the current
 * filter excludes keeps its stored title with no price rather than a guess.
 */
export function FollowingCard({ events }: { events: JupEvent[] }) {
  const following = useFollowing();
  if (!following.length) return null;

  const live = new Map<string, { yes: number; no: number; title: string }>();
  for (const event of events) {
    for (const market of event.markets) {
      live.set(market.marketId, {
        yes: market.pricing.buyYesPriceUsd,
        no: market.pricing.buyNoPriceUsd,
        title: market.title,
      });
    }
  }

  const rows = following.slice(0, MAX_ROWS);

  return (
    <section className="mt-3 border border-line bg-surface">
      <div className="flex items-baseline justify-between px-3.5 pb-1 pt-3">
        <h2 className="label text-dim">following</h2>
        <span className="tnum text-[11px] text-dim">{following.length}</span>
      </div>

      <ul>
        {rows.map((f) => {
          const now = live.get(f.marketId);
          return (
            <li key={f.marketId} className="flex items-center gap-2 border-t border-line px-3.5">
              <Link href={`/m/${f.marketId}`} className="min-w-0 flex-1 py-2.5">
                <p className="truncate text-[13.5px] text-ink">{now?.title || f.title || f.eventTitle}</p>
                <p className="truncate text-[11px] text-muted">{f.eventTitle}</p>
              </Link>
              <span className="tnum shrink-0 font-mono text-[12px] text-muted">
                {now ? `${pct(now.yes)}%` : "—"}
              </span>
              <button
                type="button"
                aria-label={`Unfollow ${f.eventTitle}`}
                onClick={() => toggleFollow(f)}
                className="shrink-0 px-1 py-2 text-dim active:text-ink"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      {following.length > MAX_ROWS ? (
        <p className="border-t border-line px-3.5 py-2 text-[11px] text-dim">
          {following.length - MAX_ROWS} more followed
        </p>
      ) : null}
    </section>
  );
}
