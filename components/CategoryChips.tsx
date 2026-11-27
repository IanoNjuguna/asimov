import Link from "next/link";
import { CATEGORIES, type CategoryKey } from "@/lib/jup";

export function CategoryChips({ active }: { active: CategoryKey }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-3">
      {CATEGORIES.map((c) => {
        const on = c.key === active;
        return (
          <Link
            key={c.key}
            href={c.key === "all" ? "/" : `/?c=${c.key}`}
            scroll={false}
            className={[
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              on
                ? "border-ink bg-ink text-canvas"
                : "border-line bg-surface text-muted active:bg-raised",
            ].join(" ")}
          >
            {c.label}
          </Link>
        );
      })}
    </div>
  );
}
