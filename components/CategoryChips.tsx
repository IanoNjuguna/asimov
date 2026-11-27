import Link from "next/link";
import { CATEGORIES, type CategoryKey } from "@/lib/jup";

export function CategoryChips({ active }: { active: CategoryKey }) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-3">
      {CATEGORIES.map((c) => {
        const on = c.key === active;
        return (
          <Link
            key={c.key}
            href={c.key === "all" ? "/" : `/?c=${c.key}`}
            scroll={false}
            className={[
              "shrink-0 border px-3 py-[7px] transition-colors",
              on
                ? "plate border-ink"
                : "border-line text-muted active:bg-surface",
            ].join(" ")}
          >
            <span className="label">{c.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
