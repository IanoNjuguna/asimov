"use client";

import { useCallback, useRef, useState } from "react";
import { FeaturedCard } from "@/components/FeaturedCard";
import type { JupEvent } from "@/lib/jup";

/**
 * Manual, not automatic. Three cards, scroll-snap, dots. Autoplay would read as a
 * billboard and pull attention off the list that exists to be scanned.
 */
export function FeaturedCarousel({ events }: { events: JupEvent[] }) {
  const scroller = useRef<HTMLUListElement | null>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const width = el.clientWidth || 1;
    setActive(Math.round(el.scrollLeft / width));
  }, []);

  const goTo = (index: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  if (!events.length) return null;
  if (events.length === 1) {
    return (
      <div className="mt-3">
        <FeaturedCard event={events[0]} className="mt-0" />
      </div>
    );
  }

  return (
    <div className="mt-3">
      <ul
        ref={scroller}
        onScroll={onScroll}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-0.5"
      >
        {events.map((event) => (
          <li key={event.eventId} className="w-full shrink-0 snap-center">
            <FeaturedCard event={event} className="mt-0" />
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {events.map((event, i) => (
          <button
            key={event.eventId}
            type="button"
            aria-label={`Featured ${i + 1}`}
            aria-current={i === active}
            onClick={() => goTo(i)}
            className={[
              "h-1.5 transition-all",
              i === active ? "w-4 bg-signal" : "w-1.5 bg-line",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
