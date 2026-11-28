import { CategoryChips } from "@/components/CategoryChips";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { pickTop } from "@/components/FeaturedCard";
import { FollowingCard } from "@/components/FollowingCard";
import { MarketRow } from "@/components/MarketRow";
import { CATEGORIES, getFeed, type CategoryKey } from "@/lib/jup";

// Live prices: render with data instead of a shell, which is what this surface is for.
export const instant = false;

/** Cards in the featured carousel. Three fits a thumb's worth of swipes. */
const FEATURED_COUNT = 3;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
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
        <div className="flex items-baseline justify-between px-4 pb-3">
          <h1 className="text-[19px] font-semibold tracking-tight">Markets</h1>
          <span className="text-[11px] uppercase tracking-[0.14em] text-dim">Solana</span>
        </div>
        <CategoryChips active={active} />
      </header>

      {failed ? (
        <p className="mx-4 mt-6 rounded-xl border border-line bg-surface p-4 text-[13px] leading-relaxed text-muted">
          Jupiter&rsquo;s prediction feed did not answer. The API is in beta and this screen is
          live data only, so nothing is cached to show. Pull to refresh in a moment.
        </p>
      ) : events.length === 0 ? (
        <p className="mx-4 mt-6 text-[13px] text-muted">No open markets in this category.</p>
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
                <MarketRow event={e} index={i} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
