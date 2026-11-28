import Link from "next/link";

// The default Next 404 is a white page in a system font, which reads as broken next to
// this surface.
export default function NotFound() {
  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+14px)]">
      <p className="text-[11px] uppercase tracking-[0.14em] text-dim">404</p>
      <h1 className="mt-2 text-[22px] font-semibold leading-tight tracking-tight text-ink">
        This market is not here
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        It may have closed, settled, or been cancelled. The feed only carries what the venue still
        prices, so a market that has resolved drops out.
      </p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-xl bg-ink px-4 py-2.5 text-[13px] font-semibold text-canvas"
      >
        Back to markets
      </Link>
    </div>
  );
}
