"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOpenPositionCount } from "@/lib/positions";

const TABS = [
  { href: "/", label: "Markets", d: "M3 4h18M3 12h18M3 20h12" },
  { href: "/portfolio", label: "Portfolio", d: "M4 7h16v12H4zM8 7V5h8v2" },
  { href: "/about", label: "About", d: "M12 8h.01M11 12h1v5h1" },
];

export function TabBar() {
  const path = usePathname();
  // Open exposure in the chrome: the scoreboard apps put their ticket count here.
  const open = useOpenPositionCount();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[520px] items-stretch pb-[env(safe-area-inset-bottom)]">
        {TABS.map((t) => {
          const on = t.href === "/" ? path === "/" || path.startsWith("/m/") : path.startsWith(t.href);
          const badge = t.href === "/portfolio" && open > 0 ? (open > 99 ? "99+" : String(open)) : null;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={[
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium tracking-wide",
                on ? "text-ink" : "text-dim",
              ].join(" ")}
            >
              <span className="relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  {t.href === "/about" ? (
                    <>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8h.01M11.5 11.5h.5v4.5h1" />
                    </>
                  ) : (
                    <path d={t.d} />
                  )}
                </svg>
                {badge ? (
                  <span className="tnum absolute -right-2.5 -top-1 min-w-[15px] rounded-full bg-ink px-1 text-center text-[9.5px] font-semibold leading-[15px] text-canvas">
                    {badge}
                  </span>
                ) : null}
              </span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
