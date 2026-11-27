import Link from "next/link";
import { notFound } from "next/navigation";
import { TradePanel } from "@/components/TradePanel";
import { cents, closesLabel, pct } from "@/lib/format";
import { getEvent, getMarket, getOrderbook } from "@/lib/jup";

// Live prices: render with data instead of a shell, which is what this surface is for.
export const instant = false;

function Depth({ levels }: { levels: [number, number][] }) {
  const top = [...levels].sort((a, b) => b[0] - a[0]).slice(0, 5);
  const max = Math.max(1, ...top.map((l) => l[1]));
  if (!top.length) return <p className="text-[12px] text-dim">No resting orders.</p>;
  return (
    <ul className="space-y-1">
      {top.map(([price, size]) => (
        <li key={price} className="relative flex items-center justify-between overflow-hidden rounded px-1.5 py-[3px]">
          <span className="absolute inset-y-0 left-0 rounded bg-line/70" style={{ width: `${(size / max) * 100}%` }} />
          <span className="tnum relative text-[12px] text-muted">{price}¢</span>
          <span className="tnum relative text-[12px] text-ink">{Math.round(size).toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let market, event, book;
  try {
    market = await getMarket(id);
    event = await getEvent(market.eventId);
    book = await getOrderbook(id).catch(() => null);
  } catch {
    notFound();
  }

  const yes = market.pricing.buyYesPriceUsd;
  const no = market.pricing.buyNoPriceUsd;
  const spread = (market.pricing.buyYesPriceUsd - market.pricing.sellYesPriceUsd) / 1e4;

  return (
    <article>
      <div className="flex items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
        <Link href="/" className="text-[13px] text-muted">
          ‹ Markets
        </Link>
        <span className="text-[11px] uppercase tracking-wide text-dim">{event?.category}</span>
      </div>

      <header className="mt-3 px-4">
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight">{event?.metadata.title}</h1>
        <p className="mt-1 text-[13px] text-muted">{market.title}</p>
      </header>

      <section className="mt-5 flex items-end justify-between gap-4 px-4">
        <div className="min-w-0">
          <p className="tnum text-[44px] font-semibold leading-none tracking-tight">
            {pct(yes)}
            <span className="text-[20px] font-normal text-dim">%</span>
          </p>
          <p className="mt-1.5 text-[12px] text-muted">
            YES · {cents(yes)} · sell {cents(market.pricing.sellYesPriceUsd)}
          </p>
        </div>
        {/* One right axis: every qualifier ends on the same edge as the figure above it. */}
        <dl className="shrink-0 text-right text-[11px] leading-[1.6] text-dim">
          <div className="flex justify-end gap-2">
            <dt>spread</dt>
            <dd className="tnum text-muted">{(spread).toFixed(1)}¢</dd>
          </div>
          {event?.metadata.closeTime ? (
            <div className="flex justify-end gap-2">
              <dt>closes</dt>
              <dd className="text-muted">{closesLabel(event.metadata.closeTime).replace(/^closes\s/, "")}</dd>
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <dt>no</dt>
            <dd className="tnum text-muted">{cents(no)}</dd>
          </div>
        </dl>
      </section>

      <TradePanel marketId={id} status={market.status} yesPrice={yes} noPrice={no} />

      {book ? (
        <section className="mx-4 mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
          <div className="bg-surface p-3">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-[11px] uppercase tracking-[0.14em] text-dim">Yes depth</h2>
              <span className="text-[10px] uppercase tracking-[0.08em] text-dim">price·size</span>
            </div>
            <Depth levels={book.yes} />
          </div>
          <div className="bg-surface p-3">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-[11px] uppercase tracking-[0.14em] text-dim">No depth</h2>
              <span className="text-[10px] uppercase tracking-[0.08em] text-dim">price·size</span>
            </div>
            <Depth levels={book.no} />
          </div>
        </section>
      ) : null}

      <section className="mx-4 mt-6 border-t border-line pt-4 pb-6">
        <h2 className="text-[11px] uppercase tracking-[0.14em] text-dim">Resolution</h2>
        <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-muted">
          {market.rulesPrimary || "Rules are published on the underlying market."}
        </p>
      </section>
    </article>
  );
}
