const SECTIONS = [
  {
    h: "Where the data comes from",
    p: "Jupiter's Prediction Market API, which aggregates Polymarket markets onto Solana. Orders settle onchain in USDC or JupUSD from a $5 minimum. Nothing here is simulated.",
  },
  {
    h: "What this app does not do",
    p: "It does not create markets, hold your funds or take the other side. Your wallet signs every order.",
  },
  {
    h: "Availability",
    p: "Trading is blocked by the venue for United States and South Korea IP addresses. If the feed is empty, that is usually why.",
  },
  {
    h: "Why the name",
    p: "Psychohistory predicted the behaviour of crowds, not of people. A price is the same claim with money behind it.",
  },
];

export default function About() {
  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+14px)] pb-10">
      <p className="label text-dim">Prediction office</p>
      <h1 className="mt-1.5 text-[22px] font-extrabold leading-none tracking-[-0.02em]">About</h1>
      <div className="ticks mt-4 h-px w-full opacity-70" />

      <p className="mt-5 text-[13.5px] leading-relaxed text-muted">
        Asimov is a market view for Solana prediction markets. A price is a probability: YES at 62¢
        means the market gives that outcome 62% odds, and a winning contract pays $1.
      </p>

      <div className="mt-4 divide-y divide-line border border-line">
        {SECTIONS.map((s) => (
          <section key={s.h} className="p-4">
            <h2 className="label-lg text-ink">{s.h}</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </div>

      <p className="label mt-5 text-dim">Powered by Jupiter ✳ Solana mainnet</p>
    </div>
  );
}
