import Link from "next/link";
import { EventThumb } from "@/components/EventThumb";
import { FollowButton } from "@/components/FollowButton";
import { cents, closesLabel, micro, pct, usd } from "@/lib/format";
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

export function MarketRow({ event, index = 0 }: { event: JupEvent; index?: number }) {
  const m = headline(event);
  if (!m) return null;

  const yes = m.pricing.buyYesPriceUsd;
  const no = m.pricing.buyNoPriceUsd;
  const vol = micro(event.volume24hr) || micro(event.volumeUsd);
  const openCount = event.markets.filter((x) => x.status === "open" && x.result === null).length;

  return (
    <div className="rise flex items-start border-b border-line" style={delayFor(index)}>
      <Link
        href={`/m/${m.marketId}`}
        className="row-press flex min-w-0 flex-1 items-center gap-3 px-4 py-3 active:bg-surface"
      >
        <EventThumb src={event.metadata.imageUrl} alt={event.metadata.title} size={44} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="line-clamp-2 min-w-0 flex-1 text-[15.5px] font-medium leading-[1.3] text-ink">
              {event.metadata.title}
            </p>
            <p className="tnum shrink-0 text-[22px] font-semibold leading-none text-ink">
              {pct(yes)}
              <span className="text-[13px] font-normal text-dim">%</span>
            </p>
          </div>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] uppercase tracking-[0.08em] text-dim">
            {event.isLive ? (
              <span className="flex items-center gap-1 text-no">
                <span className="live-dot inline-block h-[5px] w-[5px] rounded-full bg-no" />
                Live
              </span>
            ) : null}
            <span>{event.category}</span>
            <span aria-hidden>·</span>
            <span className="tnum normal-case tracking-normal">{usd(vol)} 24h</span>
            {event.metadata.closeTime ? (
              <>
                <span aria-hidden>·</span>
                <span className="normal-case tracking-normal">{closesLabel(event.metadata.closeTime)}</span>
              </>
            ) : null}
            {openCount > 1 ? (
              <>
                <span aria-hidden>·</span>
                <span className="tnum normal-case tracking-normal">{openCount} mkts</span>
              </>
            ) : (
              <span className="tnum normal-case tracking-normal">· no {cents(no)}</span>
            )}
          </p>

          {/* The % above is the YES price, so this line names the outcome it belongs to and
              carries the other side of the pair in one right-hand column. Single-market
              events have no label to show, so their pair lives on the meta line instead. */}
          {openCount > 1 ? (
            <div className="mt-1.5 flex items-baseline justify-between gap-3">
              <span className="min-w-0 flex-1 truncate text-[12px] text-muted">{m.title}</span>
              <span className="tnum shrink-0 text-[12px] text-muted">
                <span className="mr-1 text-[10px] uppercase tracking-[0.08em] text-dim">no</span>
                {cents(no)}
              </span>
            </div>
          ) : null}
        </div>
      </Link>

      {/* Its own gutter, so the star never nests inside the link and the price column
          still lines up down the feed. */}
      <div className="shrink-0 pr-1 pt-1.5">
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
