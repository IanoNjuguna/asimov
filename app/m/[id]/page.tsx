import Link from "next/link";
import { notFound } from "next/navigation";
import { EventThumb } from "@/components/EventThumb";
import { Seal } from "@/components/Seal";
import { OutcomeStrip } from "@/components/OutcomeStrip";
import { TradePanel } from "@/components/TradePanel";
import { cents, closesIn, pct } from "@/lib/format";
import { requestClock } from "@/lib/clock";
import { getEvent, getMarket, getOrderbook } from "@/lib/jup";
import { connection } from "next/server";

// Live prices: render with data instead of a shell, which is what this surface is for.
export const instant = false;

/**
 * A depth ladder, not a highlight: a real header row, fixed row heights so the two
 * sides share a baseline, and a 2px rule whose length is the size.
 */
function Depth({ levels }: { levels: [number, number][] }) {
  const top = [...levels].sort((a, b) => b[0] - a[0]).slice(0, 5);
  const max = Math.max(1, ...top.map((l) => l[1]));

  return (
    <div>
      <div className="label flex items-baseline justify-between border-b border-line pb-1 text-dim">
        <span>price</span>
        <span>size</span>
      </div>

      {top.length ? (
        <ul className="mt-1">
          {top.map(([price, size]) => (
            <li key={price} className="py-[3px]">
              <div className="flex items-baseline justify-between">
                <span className="tnum font-mono text-[11px] text-muted">{price}¢</span>
                <span className="tnum font-mono text-[11px] text-ink">{Math.round(size).toLocaleString()}</span>
              </div>
              <div className="mt-1 h-[2px] w-full bg-line/40">
                <div className="h-full bg-ink/25" style={{ width: `${(size / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="label py-2 text-dim">no resting orders</p>
      )}
    </div>
  );
}

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Same reason as the feed: the clock is request-time, never prerendered.
  await connection();
  const now = requestClock();

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
      <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
        <Link href="/" className="label text-muted active:text-ink">
          ‹ Markets
        </Link>
        <Seal className="h-7 w-7 text-dim" />
      </div>
      <div className="ticks mx-4 mt-3 h-px opacity-70" />

      <header className="mt-3 flex items-start gap-3 px-4">
        <EventThumb src={event?.metadata.imageUrl} alt={event?.metadata.title ?? market.title} size={44} />
        <div className="min-w-0">
          <h1 className="text-[23px] font-extrabold leading-[1.05] tracking-[-0.02em]">{event?.metadata.title}</h1>
          <p className="mt-1.5 font-mono text-[12px] text-muted">{market.title}</p>
        </div>
      </header>

      <section className="mt-5 flex items-end justify-between gap-4 px-4">
        <div className="min-w-0">
          <p className="tnum flex items-start gap-1 text-[48px] font-extrabold leading-none tracking-[-0.04em]">
            {pct(yes)}
            <span className="label mt-2 text-dim">%</span>
          </p>
          <p className="label mt-2 text-muted">implied chance of yes</p>
        </div>
        {/* Bid and ask on one axis: two asks sum past 100, so the pair is printed as a
            range and the spread has somewhere to live. */}
        <dl className="label shrink-0 text-right leading-[1.9] text-dim">
          <div className="flex justify-end gap-2">
            <dt>yes</dt>
            <dd className="tnum font-mono text-muted">
              {cents(market.pricing.sellYesPriceUsd)}–{cents(yes)}
            </dd>
          </div>
          <div className="flex justify-end gap-2">
            <dt>no</dt>
            <dd className="tnum font-mono text-muted">
              {cents(market.pricing.sellNoPriceUsd)}–{cents(no)}
            </dd>
          </div>
          <div className="flex justify-end gap-2">
            <dt>spread</dt>
            <dd className="tnum font-mono text-muted">{(spread).toFixed(1)}¢</dd>
          </div>
          {event?.metadata.closeTime ? (
            <div className="flex justify-end gap-2">
              <dt>closes</dt>
              <dd className="tnum font-mono text-muted">{closesIn(event.metadata.closeTime, now)}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {event ? <OutcomeStrip markets={event.markets} currentId={id} /> : null}

      <TradePanel marketId={id} status={market.status} yesPrice={yes} noPrice={no} />

      {book ? (
        <section className="mx-4 mt-5 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line">
          <div className="bg-surface px-3 pb-3 pt-2.5">
            <h2 className="label mb-1.5 text-dim">yes depth</h2>
            <Depth levels={book.yes} />
          </div>
          <div className="bg-surface px-3 pb-3 pt-2.5">
            <h2 className="label mb-1.5 text-dim">no depth</h2>
            <Depth levels={book.no} />
          </div>
        </section>
      ) : null}

      <section className="mx-4 mt-6 border-t border-line pt-4 pb-6">
        <h2 className="label text-dim">resolution</h2>
        <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-muted">
          {market.rulesPrimary || "Rules are published on the underlying market."}
        </p>
      </section>
    </article>
  );
}
