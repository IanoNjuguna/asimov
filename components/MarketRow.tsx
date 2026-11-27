import Link from "next/link";
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

export function MarketRow({ event }: { event: JupEvent }) {
  const m = headline(event);
  if (!m) return null;

  const yes = m.pricing.buyYesPriceUsd;
  const no = m.pricing.buyNoPriceUsd;
  const vol = micro(event.volume24hr) || micro(event.volumeUsd);
  const width = Math.min(100, Math.max(3, Math.round((yes / 1e6) * 100)));

  return (
    <Link
      href={`/m/${m.marketId}`}
      className="row-press flex items-start gap-3 border-b border-line px-4 py-3.5 active:bg-surface"
    >
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[15.5px] font-medium leading-[1.3] text-ink">
          {event.metadata.title}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-dim">
          <span>{event.category}</span>
          <span aria-hidden>·</span>
          <span className="tnum normal-case tracking-normal">
            {usd(vol)} 24h
          </span>
          {event.metadata.closeTime ? (
            <>
              <span aria-hidden>·</span>
              <span className="normal-case tracking-normal">
                closes {closesIn(event.metadata.closeTime)}
              </span>
            </>
          ) : null}
        </p>
      </div>

      <div className="w-[68px] shrink-0 text-right">
        <p className="tnum text-[22px] font-semibold leading-none text-ink">
          {pct(yes)}
          <span className="text-[13px] font-normal text-dim">%</span>
        </p>
        <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-yes"
            style={{ width: `${width}%` }}
          />
        </div>
        <p className="tnum mt-1.5 text-[11px] leading-none text-dim">
          no {cents(no)}
        </p>
      </div>
    </Link>
  );
}
