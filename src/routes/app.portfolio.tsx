import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Briefcase } from "lucide-react";
import { Sparkline } from "@/components/site/sparkline";
import { AnimatedNumber } from "@/components/site/animated-number";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataPanel } from "@/components/dashboard/data-panel";
import { DataTable, DataTableHead, DataTableRow, Th, Td } from "@/components/dashboard/data-table";
import { ALL_ASSETS, sparklineFor } from "@/data/markets";
import { GatedNumber, PriceLockBanner, GatedChart } from "@/components/pricing/price-gate";
import { useWallet } from "@/hooks/use-wallet";
import { useTrading } from "@/hooks/use-trading";
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices";
import {
  calcAccountMetrics,
  calcPositionPnl,
  formatSignedInr,
} from "@/lib/account-metrics";

const COLORS = ["#FFD10C", "#22c55e", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];

export const Route = createFileRoute("/app/portfolio")({
  component: PortfolioPage,
});

function PortfolioPage() {
  const { balance } = useWallet();
  const { openPositions, closedTrades, syncLivePnl } = useTrading();
  const live = useLivePrices(4000);

  useEffect(() => {
    const prices: Record<string, number> = {};
    for (const [symbol, quote] of Object.entries(live)) {
      if (quote?.price !== undefined) prices[symbol] = quote.price;
    }
    syncLivePnl(prices);
  }, [live, syncLivePnl]);

  const prices = useMemo(
    () =>
      Object.fromEntries(
        ALL_ASSETS.map((asset) => [asset.symbol, live[asset.symbol]?.price ?? asset.price]),
      ),
    [live],
  );

  const metrics = useMemo(
    () =>
      calcAccountMetrics({
        balance,
        openPositions,
        closedTrades,
        prices,
      }),
    [balance, openPositions, closedTrades, prices],
  );

  const pnl30d = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const realized30d = closedTrades
      .filter((trade) => trade.closedAt >= thirtyDaysAgo)
      .reduce((sum, trade) => sum + trade.pnl, 0);
    const equity30dAgo = Math.max(0, metrics.equity - realized30d);
    return metrics.equity - equity30dAgo;
  }, [closedTrades, metrics.equity]);

  const holdings = useMemo(() => {
    const rows = openPositions.map((position) => {
      const asset = ALL_ASSETS.find((a) => a.symbol === position.symbol);
      const lastPrice = prices[position.symbol] ?? position.price;
      const notional = position.qty * lastPrice * 100;
      const pnl = calcPositionPnl(position, lastPrice);
      return {
        id: position.id,
        sym: position.symbol,
        qty: position.qty,
        avg: position.price,
        lastPrice,
        pnl,
        notional,
        asset,
      };
    });

    const totalNotional = rows.reduce((sum, row) => sum + row.notional, 0);
    return rows.map((row) => ({
      ...row,
      alloc: totalNotional > 0 ? Math.round((row.notional / totalNotional) * 100) : 0,
    }));
  }, [openPositions, prices]);

  const instrumentCount = useMemo(
    () => new Set(openPositions.map((p) => p.symbol)).size,
    [openPositions],
  );

  const pnl30dUp = pnl30d >= 0;

  return (
    <PageShell
      eyebrow="Holdings"
      title="Portfolio"
      description="Asset allocation, open positions, and unrealised P&L across your account."
      width="2xl"
    >
      <PriceLockBanner />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Equity"
          value={
            <AnimatedNumber value={metrics.equity} format={(n) => `₹${n.toLocaleString()}`} />
          }
          icon={Briefcase}
        />
        <StatCard
          label="P&L (30d)"
          accent={pnl30dUp ? "var(--success)" : "var(--destructive)"}
          value={
            <AnimatedNumber
              value={Math.abs(pnl30d)}
              format={(n) => formatSignedInr(pnl30dUp ? n : -n)}
            />
          }
        />
        <StatCard
          label="Open positions"
          value={openPositions.length}
          sub={
            instrumentCount === 0
              ? "No active instruments"
              : `Across ${instrumentCount} instrument${instrumentCount === 1 ? "" : "s"}`
          }
        />
      </div>

      <DataPanel title="Asset allocation" description="Portfolio weight by instrument">
        {holdings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No open positions yet. Open a trade to see allocation.
          </p>
        ) : (
          <>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-surface">
              {holdings.map((h, i) => (
                <div
                  key={h.id}
                  style={{ width: `${h.alloc}%`, background: COLORS[i % COLORS.length] }}
                  title={`${h.sym} ${h.alloc}%`}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {holdings.map((h, i) => (
                <span key={h.id} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  {h.sym} · {h.alloc}%
                </span>
              ))}
            </div>
          </>
        )}
      </DataPanel>

      <DataPanel title="Positions" description="Live marks and performance" padding={false}>
        {holdings.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No open positions. Place a trade from the{" "}
            <Link to="/app/trading" className="font-medium text-[color:var(--gold)] hover:underline">
              trading terminal
            </Link>
            .
          </div>
        ) : (
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
              {holdings.map((h) => {
                const up = h.pnl >= 0;
                const lastDisplay = h.asset
                  ? formatPrice(h.asset, h.lastPrice)
                  : h.lastPrice.toFixed(2);
                return (
                  <DataTableRow key={h.id}>
                    <Td className="font-sans font-semibold">
                      <Link
                        to="/app/trading"
                        search={{ symbol: h.sym }}
                        className="hover:text-[color:var(--gold)]"
                      >
                        {h.sym}
                      </Link>
                    </Td>
                    <Td mono className="text-right">
                      {h.qty}
                    </Td>
                    <Td mono className="text-right">
                      <GatedNumber value={h.avg} />
                    </Td>
                    <Td mono className="text-right">
                      <GatedNumber value={lastDisplay} />
                    </Td>
                    <Td
                      mono
                      className={
                        "text-right font-medium " +
                        (up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")
                      }
                    >
                      <GatedNumber
                        value={h.pnl.toFixed(2)}
                        prefix={up ? "+" : ""}
                        className={
                          up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]"
                        }
                      />
                    </Td>
                    <Td>
                      <GatedChart className="w-24" showMessage>
                        <Sparkline points={sparklineFor(h.sym)} up={up} className="h-8 w-24" />
                      </GatedChart>
                    </Td>
                  </DataTableRow>
                );
              })}
            </tbody>
          </DataTable>
        )}
      </DataPanel>
    </PageShell>
  );
}
