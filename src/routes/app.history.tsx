import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";
import { DataTable, DataTableHead, DataTableRow, Th, Td } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";

export const Route = createFileRoute("/app/history")({
  component: HistoryPage,
});

const HIST = Array.from({ length: 18 }, (_, i) => {
  const syms = ["XAU/USD", "BTC/USD", "EUR/USD", "AAPL", "NIFTY50", "WTI"];
  const sides = ["BUY", "SELL"] as const;
  const seed = (i + 1) * 9301;
  const r = (seed % 233280) / 233280;
  const pnl = Math.round((r * 1200 - 500) * 100) / 100;
  return {
    id: "h" + i,
    sym: syms[i % syms.length],
    side: sides[i % 2],
    qty: Math.round((0.05 + r * 0.45) * 100) / 100,
    open: Math.round((100 + r * 2000) * 100) / 100,
    close: Math.round((100 + r * 2000 + pnl / 10) * 100) / 100,
    pnl,
    closed: `Jun ${28 - i}, 2026`,
  };
});

function HistoryPage() {
  return (
    <PageShell
      eyebrow="Archive"
      title="Trade history"
      description="Closed positions with entry, exit, and realised profit or loss."
      width="xl"
    >
      <DataPanel title="Closed trades" description={`${HIST.length} records`} padding={false}>
        <DataTable>
          <DataTableHead>
            <tr>
              <Th>Symbol</Th>
              <Th>Side</Th>
              <Th className="text-right">Qty</Th>
              <Th className="text-right">Open</Th>
              <Th className="text-right">Close</Th>
              <Th className="text-right">P&L</Th>
              <Th>Closed</Th>
            </tr>
          </DataTableHead>
          <tbody>
            {HIST.map((h) => (
              <DataTableRow key={h.id}>
                <Td className="font-sans font-semibold">{h.sym}</Td>
                <Td><StatusBadge variant={h.side === "BUY" ? "buy" : "sell"}>{h.side}</StatusBadge></Td>
                <Td mono className="text-right">{h.qty}</Td>
                <Td mono className="text-right">{h.open}</Td>
                <Td mono className="text-right">{h.close}</Td>
                <Td mono className={"text-right font-medium " + (h.pnl >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>
                  {h.pnl >= 0 ? "+" : ""}{h.pnl.toFixed(2)}
                </Td>
                <Td className="font-sans text-muted-foreground">{h.closed}</Td>
              </DataTableRow>
            ))}
          </tbody>
        </DataTable>
      </DataPanel>
    </PageShell>
  );
}
