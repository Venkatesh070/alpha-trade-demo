import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";
import { DataTable, DataTableHead, DataTableRow, Th, Td } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { GatedNumber, PriceLockBanner } from "@/components/pricing/price-gate";

export const Route = createFileRoute("/app/orders")({
  component: OrdersPage,
});

const OPEN = [
  {
    id: "o1",
    sym: "XAU/USD",
    side: "BUY" as const,
    qty: 0.1,
    price: 2412.55,
    sl: 2400,
    tp: 2440,
    pnl: 18.42,
    opened: "2m ago",
  },
  {
    id: "o2",
    sym: "EUR/USD",
    side: "SELL" as const,
    qty: 0.5,
    price: 1.0842,
    sl: 1.089,
    tp: 1.078,
    pnl: -6.2,
    opened: "14m ago",
  },
  {
    id: "o3",
    sym: "BTC/USD",
    side: "BUY" as const,
    qty: 0.01,
    price: 68420,
    sl: 67800,
    tp: 69500,
    pnl: 84.1,
    opened: "1h ago",
  },
  {
    id: "o4",
    sym: "NAS100",
    side: "BUY" as const,
    qty: 1.0,
    price: 19542,
    sl: 19400,
    tp: 19800,
    pnl: 24.0,
    opened: "3h ago",
  },
];

function OrdersPage() {
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
        title={`${OPEN.length} active positions`}
        description="Updated in real time"
        padding={false}
      >
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
            {OPEN.map((o) => (
              <DataTableRow key={o.id}>
                <Td className="font-sans font-semibold">{o.sym}</Td>
                <Td>
                  <StatusBadge variant={o.side === "BUY" ? "buy" : "sell"}>{o.side}</StatusBadge>
                </Td>
                <Td mono className="text-right">
                  {o.qty}
                </Td>
                <Td mono className="text-right">
                  <GatedNumber value={o.price} />
                </Td>
                <Td mono className="text-right text-muted-foreground">
                  <GatedNumber value={o.sl} />
                </Td>
                <Td mono className="text-right text-muted-foreground">
                  <GatedNumber value={o.tp} />
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
      </DataPanel>
    </PageShell>
  );
}
