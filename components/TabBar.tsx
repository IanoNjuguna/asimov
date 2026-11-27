"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOpenPositionCount } from "@/lib/positions";

// Type, not icons: the reference has no pictograms, and three words fit at this size.
const TABS = [
  { href: "/", label: "Markets" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
];

export function TabBar() {
  const path = usePathname();
  // Open exposure in the chrome: the scoreboard apps put their ticket count here.
  const open = useOpenPositionCount();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[520px] items-stretch pb-[env(safe-area-inset-bottom)]">
        {TABS.map((t) => {
          const on =
            t.href === "/" ? path === "/" || path.startsWith("/m/") : path.startsWith(t.href);
          const badge =
            t.href === "/portfolio" && open > 0 ? (open > 99 ? "99+" : String(open)) : null;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={[
                "relative flex flex-1 items-center justify-center gap-1.5 py-[15px]",
                on ? "text-ink" : "text-dim",
              ].join(" ")}
            >
              {on ? <span className="absolute inset-x-5 top-0 h-[2px] bg-signal" /> : null}
              <span className="label-lg">{t.label}</span>
              {badge ? (
                <span className="tnum min-w-[15px] bg-ink px-1 text-center font-mono text-[9.5px] font-semibold leading-[15px] text-canvas">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
