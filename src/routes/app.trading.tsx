import { createFileRoute } from "@tanstack/react-router";
import { TradingTerminal } from "@/components/trading/trading-terminal";

export const Route = createFileRoute("/app/trading")({
  head: () => ({
    meta: [{ title: "Trading Terminal — Exness India" }],
  }),
  component: AppTradingPage,
});

function AppTradingPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col overflow-hidden">
      <TradingTerminal className="h-full" />
    </div>
  );
}
