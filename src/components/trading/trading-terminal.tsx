import { useEffect, useState } from "react";
import { MarketWatch } from "@/components/trading/market-watch";
import { OrderPanel } from "@/components/trading/order-panel";
import { OrdersTable, type OpenOrder } from "@/components/trading/orders-table";
import { TradingChart } from "@/components/trading/chart";
import { TradingDisabledOverlay } from "@/components/trading/trading-disabled-overlay";
import { GatedChart } from "@/components/pricing/price-gate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLivePrices } from "@/hooks/use-live-prices";
import { useWallet } from "@/hooks/use-wallet";
import { getAsset } from "@/data/markets";
import { randomId } from "@/lib/id";

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1H", "4H", "1D"] as const;

export function TradingTerminal({ className }: { className?: string }) {
  const [symbol, setSymbol] = useState("BTC/USD");
  const [tf, setTf] = useState<(typeof TIMEFRAMES)[number]>("15m");
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(["BTC/USD", "XAU/USD", "EUR/USD"]),
  );
  const [orders, setOrders] = useState<OpenOrder[]>([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const live = useLivePrices(2000);
  const { balance, canTrade, refresh } = useWallet();
  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleFav = (s: string) =>
    setFavorites((prev) => {
      const n = new Set(prev);
      if (n.has(s)) n.delete(s);
      else n.add(s);
      return n;
    });

  useEffect(() => {
    setOrders((prev) =>
      prev.map((o) => {
        const cur = live[o.symbol]?.price ?? o.price;
        const diff = (cur - o.price) * (o.side === "buy" ? 1 : -1) * o.qty * 100;
        return { ...o, pnl: diff };
      }),
    );
  }, [live]);

  const place = (o: {
    side: "buy" | "sell";
    qty: number;
    type: string;
    price: number;
    symbol: string;
  }) => {
    if (!canTrade) return;
    setOrders((prev) => [{ id: randomId(), openedAt: Date.now(), pnl: 0, ...o }, ...prev]);
  };

  return (
    <div className={cn("grid min-h-0 flex-1 grid-cols-12 gap-px bg-border/60", className)}>
      <aside className="col-span-12 hidden min-h-0 bg-background lg:col-span-2 lg:block">
        <MarketWatch
          selected={symbol}
          onSelect={setSymbol}
          favorites={favorites}
          toggleFav={toggleFav}
        />
      </aside>

      <main className="relative col-span-12 flex min-h-0 flex-col bg-background lg:col-span-7">
        {!canTrade && <TradingDisabledOverlay balance={balance} />}
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
            <button className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <GatedChart className="relative min-h-[300px] flex-1" lockSize="lg">
          {mounted ? (
            <TradingChart symbol={symbol} timeframe={tf} />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Loading chart…
            </div>
          )}
        </GatedChart>

        <div className="h-64 border-t border-border/60">
          <Tabs defaultValue="open" className="flex h-full flex-col">
            <TabsList className="m-2 w-fit">
              <TabsTrigger value="open">Open ({orders.length})</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="min-h-0 flex-1">
              <OrdersTable
                orders={orders}
                onClose={(id) => setOrders((p) => p.filter((o) => o.id !== id))}
              />
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
        {!canTrade && <TradingDisabledOverlay balance={balance} />}
        <OrderPanel symbol={symbol} onPlace={place} disabled={!canTrade} />
      </aside>

      <aside className="col-span-12 max-h-64 bg-background lg:hidden">
        <MarketWatch
          selected={symbol}
          onSelect={setSymbol}
          favorites={favorites}
          toggleFav={toggleFav}
        />
      </aside>
    </div>
  );
}
