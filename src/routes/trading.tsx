import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/header";
import { MarketWatch } from "@/components/trading/market-watch";
import { OrderPanel } from "@/components/trading/order-panel";
import { OrdersTable, type OpenOrder } from "@/components/trading/orders-table";
import { TradingChart } from "@/components/trading/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLivePrices } from "@/hooks/use-live-prices";
import { getAsset } from "@/data/markets";

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1H", "4H", "1D"] as const;

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
  const [symbol, setSymbol] = useState("BTC/USD");
  const [tf, setTf] = useState<(typeof TIMEFRAMES)[number]>("15m");
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["BTC/USD", "XAU/USD", "EUR/USD"]));
  const [orders, setOrders] = useState<OpenOrder[]>([]);
  const live = useLivePrices(2000);

  const toggleFav = (s: string) => setFavorites((prev) => {
    const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n;
  });

  // Update P&L on each tick
  useEffect(() => {
    setOrders((prev) =>
      prev.map((o) => {
        const cur = live[o.symbol]?.price ?? o.price;
        const diff = (cur - o.price) * (o.side === "buy" ? 1 : -1) * o.qty * 100;
        return { ...o, pnl: diff };
      })
    );
  }, [live]);

  const place = (o: { side: "buy" | "sell"; qty: number; type: string; price: number; symbol: string }) => {
    setOrders((prev) => [
      { id: crypto.randomUUID(), openedAt: Date.now(), pnl: 0, ...o },
      ...prev,
    ]);
  };

  return (
    <div className="flex h-screen flex-col">
      <SiteHeader />
      <div className="grid min-h-0 flex-1 grid-cols-12 gap-px bg-border/60">
        {/* Left: market watch */}
        <aside className="col-span-12 hidden min-h-0 bg-background lg:col-span-2 lg:block">
          <MarketWatch selected={symbol} onSelect={setSymbol} favorites={favorites} toggleFav={toggleFav} />
        </aside>

        {/* Center: chart + tabs */}
        <main className="col-span-12 flex min-h-0 flex-col bg-background lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
            <div className="flex items-baseline gap-3">
              <div className="font-display text-lg font-bold">{symbol}</div>
              <div className="font-mono text-sm text-muted-foreground">{getAsset(symbol)?.name}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border border-border bg-surface p-0.5 text-xs">
                {TIMEFRAMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTf(t)}
                    className={cn("rounded px-2.5 py-1 font-mono", tf === t ? "bg-[color:var(--gold)] text-[color:var(--primary-foreground)]" : "text-muted-foreground hover:text-foreground")}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground">
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="relative min-h-[300px] flex-1">
            <ClientOnly fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground">Loading chart…</div>}>
              <TradingChart symbol={symbol} timeframe={tf} />
            </ClientOnly>
          </div>

          <div className="h-64 border-t border-border/60">
            <Tabs defaultValue="open" className="flex h-full flex-col">
              <TabsList className="m-2 w-fit">
                <TabsTrigger value="open">Open ({orders.length})</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="open" className="min-h-0 flex-1">
                <OrdersTable orders={orders} onClose={(id) => setOrders((p) => p.filter((o) => o.id !== id))} />
              </TabsContent>
              <TabsContent value="history" className="min-h-0 flex-1">
                <div className="grid h-full place-items-center p-6 text-sm text-muted-foreground">Closed trades appear here.</div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Right: order panel */}
        <aside className="col-span-12 min-h-0 bg-background lg:col-span-3">
          <OrderPanel symbol={symbol} onPlace={place} />
        </aside>

        {/* Mobile market watch */}
        <aside className="col-span-12 max-h-64 bg-background lg:hidden">
          <MarketWatch selected={symbol} onSelect={setSymbol} favorites={favorites} toggleFav={toggleFav} />
        </aside>
      </div>
    </div>
  );
}
