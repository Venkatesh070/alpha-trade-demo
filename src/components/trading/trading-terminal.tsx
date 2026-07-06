import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { MarketWatch } from "@/components/trading/market-watch";
import { OrderPanel } from "@/components/trading/order-panel";
import { OrdersTable, type OpenOrder } from "@/components/trading/orders-table";
import { TradingChart } from "@/components/trading/chart";
import {
  ExpandedChartShell,
  type ChartRange,
  type ChartTimeframe,
  TIMEFRAMES,
} from "@/components/trading/expanded-chart";
import { ExpandedTradingView } from "@/components/trading/expanded/expanded-trading-view";
import { FullscreenChartShell } from "@/components/trading/fullscreen-chart-view";
import { TradingDisabledOverlay } from "@/components/trading/trading-disabled-overlay";
import { GatedChart } from "@/components/pricing/price-gate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useLivePrices } from "@/hooks/use-live-prices";
import { useWallet } from "@/hooks/use-wallet";
import { useTrading } from "@/hooks/use-trading";
import { getAsset } from "@/data/markets";

export function TradingTerminal({
  className,
  initialSymbol,
  variant = "xm",
  showNavRail = true,
}: {
  className?: string;
  initialSymbol?: string;
  variant?: "xm" | "classic";
  /** Show built-in icon nav rail (off when app layout provides AppIconSidebar) */
  showNavRail?: boolean;
}) {
  const [symbol, setSymbol] = useState(initialSymbol ?? "USD/JPY");
  const [tf, setTf] = useState<ChartTimeframe>("1m");
  const [range, setRange] = useState<ChartRange>("1D");
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(["BTC/USD", "XAU/USD", "EUR/USD", "USD/JPY"]),
  );
  const [mounted, setMounted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [marketsOpen, setMarketsOpen] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  useEffect(() => {
    if (initialSymbol && getAsset(initialSymbol)) {
      setSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  const live = useLivePrices(2000);
  const { balance, canTrade, refresh } = useWallet();
  const { openPositions, placeOrder, closePosition, syncLivePnl } = useTrading();
  useEffect(() => {
    refresh();
  }, [refresh]);

  const quote = live[symbol];
  const asset = getAsset(symbol);
  const price = quote?.price ?? asset?.price ?? 0;
  const changePct = quote?.changePct ?? asset?.changePct ?? 0;

  const toggleFav = (s: string) =>
    setFavorites((prev) => {
      const n = new Set(prev);
      if (n.has(s)) n.delete(s);
      else n.add(s);
      return n;
    });

  useEffect(() => {
    const prices: Record<string, number> = {};
    for (const [symbol, quote] of Object.entries(live)) {
      if (quote?.price !== undefined) prices[symbol] = quote.price;
    }
    syncLivePnl(prices);
  }, [live, syncLivePnl]);

  const orders: OpenOrder[] = openPositions.map((position) => ({
    id: position.id,
    symbol: position.symbol,
    side: position.side,
    qty: position.qty,
    type: position.type,
    price: position.price,
    pnl: position.pnl,
    openedAt: position.openedAt,
  }));

  const place = (o: {
    side: "buy" | "sell";
    qty: number;
    type: string;
    price: number;
    symbol: string;
  }) => {
    if (!canTrade) return;
    placeOrder(o);
  };

  const handleClose = (id: string) => {
    const position = openPositions.find((item) => item.id === id);
    if (!position) return;
    const closePrice = live[position.symbol]?.price ?? position.price;
    closePosition(id, closePrice);
  };

  const chartNode = mounted ? (
    <TradingChart
      key={`${variant}-${symbol}`}
      symbol={symbol}
      timeframe={tf}
      variant="expanded"
    />
  ) : (
    <div className="grid h-full place-items-center text-sm text-muted-foreground">
      Loading chart…
    </div>
  );

  const marketWatch = (
    <MarketWatch
      selected={symbol}
      onSelect={setSymbol}
      favorites={favorites}
      toggleFav={toggleFav}
      variant={variant === "xm" ? "terminal" : "default"}
      onClose={() => setMarketsOpen(false)}
    />
  );

  if (variant === "xm") {
    const fullscreenOverlay =
      mounted &&
      createPortal(
        <AnimatePresence mode="wait">
          {fullscreen && (
            <FullscreenChartShell
              key="fullscreen-chart"
              symbol={symbol}
              asset={asset}
              timeframe={tf}
              onTimeframeChange={setTf}
              range={range}
              onRangeChange={setRange}
              onClose={() => setFullscreen(false)}
              onSymbolChange={setSymbol}
              price={price}
              changePct={changePct}
              isFavorite={favorites.has(symbol)}
              onToggleFavorite={() => toggleFav(symbol)}
            >
              <GatedChart className="absolute inset-0 h-full w-full" lockSize="lg">
                <TradingChart
                  key={`fullscreen-${symbol}`}
                  symbol={symbol}
                  timeframe={tf}
                  variant="expanded"
                />
              </GatedChart>
            </FullscreenChartShell>
          )}
        </AnimatePresence>,
        document.body,
      );

    return (
      <div className={cn("relative h-full min-h-0", className)}>
        {fullscreenOverlay}
        <ExpandedTradingView
          embedded
          showNavRail={showNavRail}
          marketsOpen={marketsOpen}
          onMarketsOpenChange={setMarketsOpen}
          marketsPanel={marketWatch}
          chart={
            <>
              {!canTrade && <TradingDisabledOverlay balance={balance} />}
              <ExpandedChartShell
                symbol={symbol}
                onSymbolChange={setSymbol}
                timeframe={tf}
                onTimeframeChange={setTf}
                range={range}
                onRangeChange={setRange}
                onExpand={() => setFullscreen(true)}
                price={price}
                changePct={changePct}
                isFavorite={favorites.has(symbol)}
                onToggleFavorite={() => toggleFav(symbol)}
              >
                <GatedChart className="absolute inset-0 h-full w-full" lockSize="lg">
                  {chartNode}
                </GatedChart>
              </ExpandedChartShell>
            </>
          }
        />
      </div>
    );
  }

  const orderPanel = (
    <>
      {!canTrade && <TradingDisabledOverlay balance={balance} />}
      <OrderPanel symbol={symbol} onPlace={place} disabled={!canTrade} />
    </>
  );

  return (
    <div className={cn("grid min-h-0 flex-1 grid-cols-12 gap-px bg-border/60", className)}>
      <aside className="col-span-12 hidden min-h-0 bg-background lg:col-span-2 lg:block">
        {marketWatch}
      </aside>

      <main className="relative col-span-12 flex min-h-0 flex-col bg-background lg:col-span-7">
        {!canTrade && <TradingDisabledOverlay balance={balance} />}

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
          <div className="flex items-baseline gap-3">
            <div className="font-display text-lg font-bold">{symbol}</div>
            <div className="font-mono text-sm text-muted-foreground">{asset?.name}</div>
          </div>
          <div className="flex rounded-md border border-border bg-surface p-0.5 text-xs">
            {TIMEFRAMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTf(t)}
                className={cn(
                  "rounded px-2.5 py-1 font-mono",
                  tf === t
                    ? "bg-[color:var(--gold)] text-[color:var(--primary-foreground)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <GatedChart className="relative min-h-[300px] flex-1" lockSize="lg">
          {chartNode}
        </GatedChart>

        <div className="h-64 border-t border-border/60">
          <Tabs defaultValue="open" className="flex h-full flex-col">
            <TabsList className="m-2 w-fit">
              <TabsTrigger value="open">Open ({orders.length})</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="min-h-0 flex-1">
              <OrdersTable orders={orders} onClose={handleClose} />
            </TabsContent>
            <TabsContent value="history" className="min-h-0 flex-1">
              <div className="grid h-full place-items-center p-6 text-sm text-muted-foreground">
                Closed trades appear here.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <aside className="relative col-span-12 min-h-0 bg-background lg:col-span-3">
        {orderPanel}
      </aside>

      <aside className="col-span-12 max-h-64 bg-background lg:hidden">{marketWatch}</aside>
    </div>
  );
}
