import { PortfolioView } from "@/components/PortfolioView";

export default function Portfolio() {
  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+14px)]">
      <h1 className="text-[19px] font-semibold tracking-tight">Portfolio</h1>
      <PortfolioView />
    </div>
  );
}
