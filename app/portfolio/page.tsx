export default function Portfolio() {
  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+14px)]">
      <h1 className="text-[19px] font-semibold tracking-tight">Portfolio</h1>
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <p className="text-[14px] font-medium text-ink">No positions yet</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Connect a wallet holding USDC and your positions, cost basis and P&amp;L appear here.
          Positions pay $1 per contract when the market settles.
        </p>
      </div>
    </div>
  );
}
