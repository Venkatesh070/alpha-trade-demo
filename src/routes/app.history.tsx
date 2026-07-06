import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";
import { DataTable, DataTableHead, DataTableRow, Th, Td } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useTrading } from "@/hooks/use-trading";

export const Route = createFileRoute("/app/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const { closedTrades } = useTrading();

  const history = useMemo(
    () =>
      closedTrades.map((trade) => ({
        ...trade,
        closed: new Date(trade.closedAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })),
    [closedTrades],
  );

  return (
    <PageShell
      eyebrow="Archive"
      title="Trade history"
      description="Closed positions with entry, exit, and realised profit or loss."
      width="xl"
    >
      <DataPanel title="Closed trades" description={`${history.length} records`} padding={false}>
        {history.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No closed trades yet. Close a position from the terminal to see it here.
          </div>
        ) : (
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
              {history.map((h) => (
                <DataTableRow key={h.id}>
                  <Td className="font-sans font-semibold">{h.symbol}</Td>
                  <Td>
                    <StatusBadge variant={h.side === "buy" ? "buy" : "sell"}>
                      {h.side.toUpperCase()}
                    </StatusBadge>
                  </Td>
                  <Td mono className="text-right">
                    {h.qty}
                  </Td>
                  <Td mono className="text-right">
                    {h.openPrice}
                  </Td>
                  <Td mono className="text-right">
                    {h.closePrice}
                  </Td>
                  <Td
                    mono
                    className={
                      "text-right font-medium " +
                      (h.pnl >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")
                    }
                  >
                    {h.pnl >= 0 ? "+" : ""}
                    {h.pnl.toFixed(2)}
                  </Td>
                  <Td className="font-sans text-muted-foreground">{h.closed}</Td>
                </DataTableRow>
              ))}
            </tbody>
          </DataTable>
        )}
      </DataPanel>
    </PageShell>
  );
}
