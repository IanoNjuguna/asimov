import Link from "next/link";
import { EventThumb } from "@/components/EventThumb";
import { FollowButton } from "@/components/FollowButton";
import { Spec } from "@/components/Spec";
import { cents, closesIn, micro, pct, usd } from "@/lib/format";
import type { JupEvent } from "@/lib/jup";

function headline(event: JupEvent) {
  const open = event.markets.filter((m) => m.status === "open" && m.result === null);
  const pool = open.length ? open : event.markets;
  // The most contested market is the interesting one to headline.
  return pool.reduce((best, m) => {
    const d = Math.abs(m.pricing.buyYesPriceUsd - 500_000);
    const bd = Math.abs(best.pricing.buyYesPriceUsd - 500_000);
    return d < bd ? m : best;
  }, pool[0]);
}

/** Stagger is capped at the first screen: nothing below the fold waits on an animation. */
const delayFor = (index: number) => ({ animationDelay: `${Math.min(index, 8) * 22}ms` });

export function MarketRow({ event, index = 0, now }: { event: JupEvent; index?: number; now: number }) {
  const m = headline(event);
  if (!m) return null;

  const yes = m.pricing.buyYesPriceUsd;
  const no = m.pricing.buyNoPriceUsd;
  const vol = micro(event.volume24hr) || micro(event.volumeUsd);
  const openCount = event.markets.filter((x) => x.status === "open" && x.result === null).length;
  const width = Math.min(100, Math.max(2, Math.round((yes / 1e6) * 100)));

  return (
    <div className="rise flex items-start border-b border-line" style={delayFor(index)}>
      <Link
        href={`/m/${m.marketId}`}
        className="row-press flex min-w-0 flex-1 items-start gap-3 px-4 py-3.5 active:bg-surface"
      >
        <EventThumb
          src={event.metadata.imageUrl}
          alt={event.metadata.title}
          size={40}
          className="mt-0.5 border border-line"
        />

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[15.5px] font-semibold leading-[1.25] tracking-[-0.005em] text-ink">
            {event.metadata.title}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1">
            {event.isLive ? (
              <span className="label flex items-center gap-1 text-signal">
                <span className="live-dot inline-block h-[5px] w-[5px] bg-signal" />
                live
              </span>
            ) : null}
            <Spec
              items={[
                { k: event.category },
                { k: `${usd(vol)} 24h` },
                ...(event.metadata.closeTime
                  ? [{ k: "closes", v: closesIn(event.metadata.closeTime, now) }]
                  : []),
                ...(openCount > 1 ? [{ k: `${openCount} mkts` }] : []),
              ]}
            />
          </div>

          {openCount > 1 ? (
            <p className="mt-1.5 truncate font-mono text-[11px] text-muted">{m.title}</p>
          ) : null}
        </div>

        <div className="w-[62px] shrink-0 text-right">
          <p className="tnum flex items-start justify-end gap-1 text-[23px] font-extrabold leading-none tracking-[-0.03em] text-ink">
            {pct(yes)}
            <span className="label mt-1 text-dim">%</span>
          </p>
          <div className="mt-2 h-[3px] w-full bg-line">
            <div className="h-full bg-signal" style={{ width: `${width}%` }} />
          </div>
          <p className="tnum mt-[6px] font-mono text-[10px] leading-none text-dim">NO {cents(no)}</p>
        </div>
      </Link>

      {/* Its own gutter, so the star never nests inside the link and the price column
          still lines up down the feed. */}
      <div className="shrink-0 pr-1 pt-2">
        <FollowButton
          entry={{
            marketId: m.marketId,
            title: m.title,
            eventTitle: event.metadata.title,
          }}
        />
      </div>
    </div>
  );
}
