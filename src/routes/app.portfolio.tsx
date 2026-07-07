import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Briefcase, Plus } from "lucide-react";
import { Sparkline } from "@/components/site/sparkline";
import { AnimatedNumber } from "@/components/site/animated-number";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataPanel } from "@/components/dashboard/data-panel";
import { DataTable, DataTableHead, DataTableRow, Th, Td } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { ALL_ASSETS, sparklineFor } from "@/data/markets";
import { GatedNumber, PriceLockBanner, GatedChart } from "@/components/pricing/price-gate";
import { useTrading } from "@/hooks/use-trading";
import { useWallet } from "@/hooks/use-wallet";
import { useLivePrices } from "@/hooks/use-live-prices";
import { calcAccountMetrics } from "@/lib/account-metrics";

const COLORS = ["#FFD10C", "#22c55e", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];

export const Route = createFileRoute("/app/portfolio")({
  component: PortfolioPage,
});

function PortfolioPage() {
  const { balance } = useWallet();
  const { openPositions, closedTrades, syncLivePnl } = useTrading();
  const live = useLivePrices(4000);

  const prices = useMemo(
    () =>
      Object.fromEntries(
        ALL_ASSETS.map((asset) => [asset.symbol, live[asset.symbol]?.price ?? asset.price]),
      ),
    [live],
  );

  useEffect(() => {
    syncLivePnl(prices);
  }, [prices, syncLivePnl]);

  const metrics = useMemo(
    () => calcAccountMetrics({ balance, openPositions, closedTrades, prices }),
    [balance, openPositions, closedTrades, prices],
  );

  const pnl30d = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const realized = closedTrades
      .filter((trade) => trade.closedAt >= thirtyDaysAgo)
      .reduce((sum, trade) => sum + trade.pnl, 0);
    return realized + metrics.unrealizedPnl;
  }, [closedTrades, metrics.unrealizedPnl]);

  const allocation = useMemo(() => {
    const bySymbol = new Map<string, number>();
    for (const position of openPositions) {
      const price = prices[position.symbol] ?? position.price;
      const notional = Math.abs(position.qty * price * 100);
      bySymbol.set(position.symbol, (bySymbol.get(position.symbol) ?? 0) + notional);
    }
    const total = [...bySymbol.values()].reduce((sum, value) => sum + value, 0);
    return [...bySymbol.entries()]
      .map(([sym, notional]) => ({
        sym,
        alloc: total > 0 ? Math.round((notional / total) * 100) : 0,
      }))
      .sort((a, b) => b.alloc - a.alloc);
  }, [openPositions, prices]);

  const instrumentCount = useMemo(
    () => new Set(openPositions.map((position) => position.symbol)).size,
    [openPositions],
  );

  const pnlUp = pnl30d >= 0;

  return (
    <PageShell
      eyebrow="Holdings"
      title="Portfolio"
      description="Asset allocation, open positions, and unrealised P&L across your account."
      width="2xl"
      actions={
        <Button asChild className="gold-button hover:gold-button-hover">
          <Link to="/app/trading">
            <Plus className="mr-2 h-4 w-4" /> New trade
          </Link>
        </Button>
      }
    >
      <PriceLockBanner />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Equity"
          value={
            <AnimatedNumber value={metrics.equity} format={(n) => `₹${Math.round(n).toLocaleString()}`} />
          }
          icon={Briefcase}
        />
        <StatCard
          label="P&L (30d)"
          accent={pnlUp ? "var(--success)" : "var(--destructive)"}
          value={
            <AnimatedNumber
              value={Math.abs(pnl30d)}
              format={(n) => `${pnlUp ? "+" : "-"}₹${Math.round(n).toLocaleString()}`}
            />
          }
        />
        <StatCard
          label="Open positions"
          value={openPositions.length}
          sub={
            instrumentCount > 0
              ? `Across ${instrumentCount} instrument${instrumentCount === 1 ? "" : "s"}`
              : "No active holdings"
          }
        />
      </div>

      {openPositions.length === 0 ? (
        <DataPanel title="No holdings yet" description="Open a position from the trading terminal">
          <div className="py-8 text-center text-sm text-muted-foreground">
            Your portfolio will update automatically as you trade.
          </div>
        </DataPanel>
      ) : (
        <>
          <DataPanel title="Asset allocation" description="Portfolio weight by instrument">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-surface">
              {allocation.map((item, i) => (
                <div
                  key={item.sym}
                  style={{ width: `${item.alloc}%`, background: COLORS[i % COLORS.length] }}
                  title={`${item.sym} ${item.alloc}%`}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {allocation.map((item, i) => (
                <span key={item.sym} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  {item.sym} · {item.alloc}%
                </span>
              ))}
            </div>
          </DataPanel>

          <DataPanel title="Positions" description="Live marks and performance" padding={false}>
            <DataTable>
              <DataTableHead>
                <tr>
                  <Th>Symbol</Th>
                  <Th className="text-right">Qty</Th>
                  <Th className="text-right">Avg price</Th>
                  <Th className="text-right">Last</Th>
                  <Th className="text-right">P&L</Th>
                  <Th>Trend</Th>
                </tr>
              </DataTableHead>
              <tbody>
                {openPositions.map((position) => {
                  const last = prices[position.symbol] ?? position.price;
                  const up = position.pnl >= 0;
                  return (
                    <DataTableRow key={position.id}>
                      <Td className="font-sans font-semibold">
                        <Link
                          to="/app/trading"
                          search={{ symbol: position.symbol }}
                          className="hover:text-[color:var(--gold)]"
                        >
                          {position.symbol}
                        </Link>
                      </Td>
                      <Td mono className="text-right">
                        {position.qty}
                      </Td>
                      <Td mono className="text-right">
                        <GatedNumber value={position.price} />
                      </Td>
                      <Td mono className="text-right">
                        <GatedNumber value={last} />
                      </Td>
                      <Td
                        mono
                        className={
                          "text-right font-medium " +
                          (up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")
                        }
                      >
                        <GatedNumber
                          value={position.pnl.toFixed(2)}
                          prefix={up ? "+" : ""}
                          className={
                            up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]"
                          }
                        />
                      </Td>
                      <Td>
                        <GatedChart className="w-24" showMessage>
                          <Sparkline
                            points={sparklineFor(position.symbol)}
                            up={up}
                            className="h-8 w-24"
                          />
                        </GatedChart>
                      </Td>
                    </DataTableRow>
                  );
                })}
              </tbody>
            </DataTable>
          </DataPanel>
        </>
      )}
    </PageShell>
  );
}
