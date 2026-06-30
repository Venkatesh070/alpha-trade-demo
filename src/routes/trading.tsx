import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/header";
import { TradingTerminal } from "@/components/trading/trading-terminal";

export const Route = createFileRoute("/trading")({
  head: () => ({
    meta: [
      { title: "Trading Terminal — Exness India" },
      { name: "description", content: "Professional trading terminal with live charts, market watch, and one-click execution." },
    ],
  }),
  component: TradingPage,
});

function TradingPage() {
  return (
    <div className="flex h-screen flex-col">
      <SiteHeader />
      <TradingTerminal className="flex-1" />
    </div>
  );
}
