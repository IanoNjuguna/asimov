import { CategoryFilter } from "@/components/CategoryFilter";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { pickTop } from "@/components/FeaturedCard";
import { FollowingCard } from "@/components/FollowingCard";
import { MarketRow } from "@/components/MarketRow";
import { Mark } from "@/components/Mark";
import { requestClock } from "@/lib/clock";
import { CATEGORIES, getFeed, type CategoryKey } from "@/lib/jup";
import { connection } from "next/server";

// Live prices: render with data instead of a shell, which is what this surface is for.
export const instant = false;

/** Cards in the featured carousel. Three fits a thumb's worth of swipes. */
const FEATURED_COUNT = 3;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  // The clock is request-time, never prerendered: see lib/clock.ts.
  await connection();
  const now = requestClock();

  const { c } = await searchParams;
  const active: CategoryKey = CATEGORIES.some((x) => x.key === c)
    ? (c as CategoryKey)
    : "all";

  let events = [] as Awaited<ReturnType<typeof getFeed>>;
  let failed = false;
  try {
    events = await getFeed(active);
  } catch {
    failed = true;
  }

  // One carousel above the list, the same rows below it: whatever is featured is not
  // repeated immediately beneath itself.
  const featured = pickTop(events, FEATURED_COUNT);
  const featuredIds = new Set(featured.map((e) => e.eventId));
  const rest = events.filter((e) => !featuredIds.has(e.eventId));

  return (
    <div>
      <header className="sticky top-0 z-30 bg-canvas/95 pt-[calc(env(safe-area-inset-top)+14px)] backdrop-blur">
        <div className="flex items-end justify-between px-4 pb-3">
          <div className="flex items-end gap-2.5">
            <Mark className="mb-[2px] h-[18px] w-[21px] shrink-0" />
            <div>
              <h1 className="text-[20px] font-extrabold leading-none tracking-[-0.02em]">
                Asimov
              </h1>
              <p className="label mt-[5px] text-dim">Prediction office</p>
            </div>
          </div>
          <p className="label text-right leading-[1.5] text-dim">
            Solana
            <br />
            mainnet ✳
          </p>
        </div>
        <CategoryFilter active={active} />
        <div className="ticks h-px w-full opacity-70" />
      </header>

      {failed ? (
        <p className="mx-4 mt-6 border border-line bg-surface p-4 text-[13px] leading-relaxed text-muted">
          Jupiter&rsquo;s prediction feed did not answer. The API is in beta and this screen is
          live data only, so nothing is cached to show. Pull to refresh in a moment.
        </p>
      ) : events.length === 0 ? (
        <p className="label mx-4 mt-6 text-dim">No open markets in this category</p>
      ) : (
        <>
          <div className="px-4">
            <FollowingCard events={events} />
          </div>
          <div className="px-4">
            <FeaturedCarousel events={featured} />
          </div>
          <ul>
            {rest.map((e, i) => (
              <li key={e.eventId}>
                <MarketRow event={e} index={i} now={now} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
