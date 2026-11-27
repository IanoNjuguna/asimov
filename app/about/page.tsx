export default function About() {
  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+14px)] pb-8">
      <h1 className="text-[19px] font-semibold tracking-tight">About</h1>

      <section className="mt-5 space-y-4 text-[13.5px] leading-relaxed text-muted">
        <p>
          Asimov is a market view for Solana prediction markets. A price is a probability: YES at
          62¢ means the market gives that outcome 62% odds, and a winning contract pays $1.
        </p>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-[13px] font-medium text-ink">Where the data comes from</h2>
          <p className="mt-1.5">
            Jupiter&rsquo;s Prediction Market API, which aggregates Polymarket markets onto Solana.
            Orders settle onchain in USDC or JupUSD from a $5 minimum. Nothing here is simulated.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-[13px] font-medium text-ink">What this app does not do</h2>
          <p className="mt-1.5">
            It does not create markets, hold your funds or take the other side. Your wallet signs
            every order.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="text-[13px] font-medium text-ink">Availability</h2>
          <p className="mt-1.5">
            Trading is blocked by the venue for United States and South Korea IP addresses. If the
            feed is empty, that is usually why.
          </p>
        </div>
      </section>
    </div>
  );
}
