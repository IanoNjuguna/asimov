import Link from "next/link";
import { pct } from "@/lib/format";
import type { JupMarket } from "@/lib/jup";

const MAX_SHOWN = 20;

/**
 * The feed row says "12 mkts" and the market page used to be a dead end: one outcome,
 * no way to the siblings. Every sibling is already in the event payload.
 */
export function OutcomeStrip({ markets, currentId }: { markets: JupMarket[]; currentId: string }) {
  const open = markets.filter((m) => m.status === "open" && m.result === null);
  if (open.length < 2) return null;

  const current = open.find((m) => m.marketId === currentId);
  const rest = open.filter((m) => m.marketId !== currentId);
  const ordered = current ? [current, ...rest] : rest;
  const shown = ordered.slice(0, MAX_SHOWN);
  const hidden = ordered.length - shown.length;

  return (
    <section className="mt-5">
      <div className="flex items-baseline justify-between px-4">
        <h2 className="label text-dim">outcomes</h2>
        <span className="tnum font-mono text-[10px] text-dim">{open.length}</span>
      </div>

      <ul className="no-scrollbar mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
        {shown.map((m) => {
          const on = m.marketId === currentId;
          return (
            <li key={m.marketId} className="shrink-0">
              <Link
                href={`/m/${m.marketId}`}
                aria-current={on}
                className={[
                  "flex w-[132px] flex-col gap-1 border px-3 py-2",
                  on ? "plate border-ink" : "border-line bg-canvas active:bg-surface",
                ].join(" ")}
              >
                <span className="line-clamp-2 h-[30px] text-[12px] leading-[1.25]">{m.title}</span>
                <span className="tnum font-mono text-[15px] font-medium">
                  {pct(m.pricing.buyYesPriceUsd)}
                  <span className="text-[12px] font-normal text-muted">%</span>
                </span>
              </Link>
            </li>
          );
        })}
        {hidden > 0 ? (
          <li className="flex w-[92px] shrink-0 items-center justify-center border border-line font-mono text-[12px] text-dim">
            +{hidden}
          </li>
        ) : null}
      </ul>
    </section>
  );
}
