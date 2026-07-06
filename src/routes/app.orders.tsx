import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";
import { DataTable, DataTableHead, DataTableRow, Th, Td } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { GatedNumber, PriceLockBanner } from "@/components/pricing/price-gate";
import { useTrading } from "@/hooks/use-trading";
import { useLivePrices } from "@/hooks/use-live-prices";
import { relativeTime } from "@/lib/account-metrics";

export const Route = createFileRoute("/app/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { openPositions, syncLivePnl } = useTrading();
  const live = useLivePrices(4000);

  useEffect(() => {
    const prices: Record<string, number> = {};
    for (const [symbol, quote] of Object.entries(live)) {
      if (quote?.price !== undefined) prices[symbol] = quote.price;
    }
    syncLivePnl(prices);
  }, [live, syncLivePnl]);

  const open = useMemo(
    () =>
      openPositions.map((position) => ({
        ...position,
        opened: relativeTime(position.openedAt),
      })),
    [openPositions],
  );

  return (
    <PageShell
      eyebrow="Execution"
      title="Open orders"
      description="Monitor live positions, stops, targets, and floating P&L."
      width="xl"
      actions={
        <Button asChild className="gold-button hover:gold-button-hover">
          <Link to="/app/trading">
            <Plus className="mr-2 h-4 w-4" /> New trade
          </Link>
        </Button>
      }
    >
      <PriceLockBanner />

      <DataPanel
        title={`${open.length} active positions`}
        description="Updated in real time"
        padding={false}
      >
        {open.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No open positions. Place a trade from the terminal.
          </div>
        ) : (
          <DataTable>
            <DataTableHead>
              <tr>
                <Th>Symbol</Th>
                <Th>Side</Th>
                <Th className="text-right">Qty</Th>
                <Th className="text-right">Open</Th>
                <Th className="text-right">SL</Th>
                <Th className="text-right">TP</Th>
                <Th className="text-right">P&L</Th>
                <Th>Opened</Th>
              </tr>
            </DataTableHead>
            <tbody>
              {open.map((o) => (
                <DataTableRow key={o.id}>
                  <Td className="font-sans font-semibold">{o.symbol}</Td>
                  <Td>
                    <StatusBadge variant={o.side === "buy" ? "buy" : "sell"}>
                      {o.side.toUpperCase()}
                    </StatusBadge>
                  </Td>
                  <Td mono className="text-right">
                    {o.qty}
                  </Td>
                  <Td mono className="text-right">
                    <GatedNumber value={o.price} />
                  </Td>
                  <Td mono className="text-right text-muted-foreground">
                    <GatedNumber value={o.sl ?? "—"} />
                  </Td>
                  <Td mono className="text-right text-muted-foreground">
                    <GatedNumber value={o.tp ?? "—"} />
                  </Td>
                  <Td
                    mono
                    className={
                      "text-right font-medium " +
                      (o.pnl >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")
                    }
                  >
                    <GatedNumber
                      value={o.pnl.toFixed(2)}
                      prefix={o.pnl >= 0 ? "+" : ""}
                      className={
                        o.pnl >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]"
                      }
                    />
                  </Td>
                  <Td className="font-sans text-muted-foreground">{o.opened}</Td>
                </DataTableRow>
              ))}
            </tbody>
          </DataTable>
        )}
      </DataPanel>
    </PageShell>
  );
}
