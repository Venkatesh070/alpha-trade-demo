import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@/components/client-only";
import { TradingTerminal } from "@/components/trading/trading-terminal";
import { TradingErrorBoundary } from "@/components/trading/trading-error-boundary";
import { TradingLoadingShell } from "@/components/trading/trading-loading-shell";
import { parseTradingSearch } from "@/lib/trading-search";

export const Route = createFileRoute("/app/trading")({
  validateSearch: parseTradingSearch,
  head: () => ({
    meta: [{ title: "Trading Terminal — Exness India" }],
  }),
  component: AppTradingPage,
});

function AppTradingPage() {
  const { symbol } = Route.useSearch();

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden">
      <ClientOnly fallback={<TradingLoadingShell />}>
        <TradingErrorBoundary>
          <TradingTerminal
            className="h-full"
            initialSymbol={symbol}
            variant="xm"
            showNavRail={false}
          />
        </TradingErrorBoundary>
      </ClientOnly>
    </div>
  );
}
