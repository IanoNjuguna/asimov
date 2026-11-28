"use client";

import Link from "next/link";
import { useState } from "react";
import { Sheet } from "@/components/Sheet";
import { CATEGORIES, type CategoryKey } from "@/lib/jup";

/**
 * The taxonomy is going to grow, so it does not get a scrolling row that clips itself at
 * the edge. The current filter stays visible as one control; everything else is one tap
 * away in a sheet that can hold twenty categories as easily as eight.
 */
export function CategoryFilter({ active }: { active: CategoryKey }) {
  const [open, setOpen] = useState(false);
  const current = CATEGORIES.find((c) => c.key === active) ?? CATEGORIES[0];

  return (
    <>
      <div className="flex items-center justify-between px-4 pb-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="flex items-center gap-2 border border-line px-3 py-[7px] active:bg-surface"
        >
          <span className="label text-ink">{current.label}</span>
          <svg
            width="9"
            height="9"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="text-dim"
          >
            <path d="M2 4l3 3 3-3" />
          </svg>
        </button>
        <span className="label text-dim">{CATEGORIES.length} categories</span>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} labelledBy="category-sheet">
        <p id="category-sheet" className="label-lg text-ink">
          filter by category
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => {
            const on = c.key === active;
            return (
              <Link
                key={c.key}
                href={c.key === "all" ? "/" : `/?c=${c.key}`}
                scroll={false}
                onClick={() => setOpen(false)}
                aria-current={on}
                className={[
                  "flex items-center justify-between border px-3 py-3",
                  on ? "plate border-ink" : "border-line text-muted active:bg-surface",
                ].join(" ")}
              >
                <span className="label">{c.label}</span>
                {on ? <span className="label text-[9px] opacity-60">now</span> : null}
              </Link>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}
