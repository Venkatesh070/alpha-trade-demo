import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@/components/client-only";
import { SiteHeader } from "@/components/site/header";
import { TradingTerminal } from "@/components/trading/trading-terminal";
import { TradingLoadingShell } from "@/components/trading/trading-loading-shell";
import { parseTradingSearch } from "@/lib/trading-search";

export const Route = createFileRoute("/trading")({
  validateSearch: parseTradingSearch,
  head: () => ({
    meta: [
      { title: "Trading Terminal — Exness India" },
      {
        name: "description",
        content:
          "Professional trading terminal with live charts, market watch, and one-click execution.",
      },
    ],
  }),
  component: TradingPage,
});

function TradingPage() {
  const { symbol } = Route.useSearch();

  return (
    <div className="flex h-screen flex-col">
      <SiteHeader />
      <ClientOnly fallback={<TradingLoadingShell />}>
        <TradingTerminal className="flex-1" initialSymbol={symbol} variant="xm" />
      </ClientOnly>
    </div>
  );
}
