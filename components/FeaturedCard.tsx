import Link from "next/link";
import { EventThumb } from "@/components/EventThumb";
import { cents, closesLabel, micro, pct, usd } from "@/lib/format";
import type { JupEvent } from "@/lib/jup";

/** The loudest open events by 24h volume. */
export function pickTop(events: JupEvent[], n: number): JupEvent[] {
  return events
    .filter((e) => e.markets.some((m) => m.status === "open" && m.result === null))
    .sort((a, b) => (micro(b.volume24hr) || micro(b.volumeUsd)) - (micro(a.volume24hr) || micro(a.volumeUsd)))
    .slice(0, n);
}

/** The loudest open event by 24h volume, or null when nothing qualifies. */
export function pickFeatured(events: JupEvent[]): JupEvent | null {
  return pickTop(events, 1)[0] ?? null;
}

export function featuredMarket(event: JupEvent) {
  const open = event.markets.filter((m) => m.status === "open" && m.result === null);
  const pool = open.length ? open : event.markets;
  return pool.reduce((best, m) => {
    const d = Math.abs(m.pricing.buyYesPriceUsd - 500_000);
    const bd = Math.abs(best.pricing.buyYesPriceUsd - 500_000);
    return d < bd ? m : best;
  }, pool[0]);
}

/**
 * One object carries the identity of the feed; the list below carries the scanning.
 * Same data as a row, a different amount of air.
 */
export function FeaturedCard({ event, className = "mt-3" }: { event: JupEvent; className?: string }) {
  const market = featuredMarket(event);
  if (!market) return null;

  const yes = market.pricing.buyYesPriceUsd;
  const no = market.pricing.buyNoPriceUsd;
  const vol = micro(event.volume24hr) || micro(event.volumeUsd);

  return (
    <Link
      href={`/m/${market.marketId}`}
      className={`row-press block border border-line bg-surface p-3 active:bg-raised ${className}`}
    >
      <div className="flex items-start gap-3">
        <EventThumb src={event.metadata.imageUrl} alt={event.metadata.title} size={56} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[16px] font-medium leading-[1.28] text-ink">
            {event.metadata.title}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[11px] uppercase tracking-[0.08em] text-dim">
            {event.isLive ? (
              <span className="flex items-center gap-1 text-signal">
                <span className="live-dot inline-block h-[5px] w-[5px] bg-signal" />
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
          </p>
        </div>
        <p className="tnum shrink-0 text-[26px] font-extrabold leading-none tracking-[-0.03em] text-ink">
          {pct(yes)}
          <span className="text-[14px] font-normal text-dim">%</span>
        </p>
      </div>

      <div className="mt-3">
        <p className="truncate text-[12px] text-muted">{market.title}</p>
        <div className="mt-1.5 grid grid-cols-2 border-t border-line">
          <div className="flex items-baseline justify-between py-2 pr-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-dim">Yes</span>
            <span className="tnum font-mono text-[13px] text-ink">{cents(yes)}</span>
          </div>
          <div className="flex items-baseline justify-between border-l border-line py-2 pl-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-dim">No</span>
            <span className="tnum font-mono text-[13px] text-ink">{cents(no)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
