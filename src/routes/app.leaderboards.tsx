import { createFileRoute } from "@tanstack/react-router";
import { LEADERBOARD } from "@/data/content";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";
import { DataTable, DataTableHead, DataTableRow, Th, Td } from "@/components/dashboard/data-table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/leaderboards")({
  component: LeaderboardsPage,
});

function LeaderboardsPage() {
  return (
    <PageShell
      eyebrow="Rankings"
      title="Leaderboards"
      description="Top 50 demo accounts by 30-day P&L. Rankings refresh every minute."
      width="lg"
    >
      <DataPanel title="Top traders" description="Sorted by realised P&L" padding={false}>
        <DataTable>
          <DataTableHead>
            <tr>
              <Th>Rank</Th>
              <Th>Trader</Th>
              <Th>Country</Th>
              <Th className="text-right">Trades</Th>
              <Th className="text-right">ROI</Th>
              <Th className="text-right">P&L</Th>
            </tr>
          </DataTableHead>
          <tbody>
            {LEADERBOARD.map((e) => (
              <DataTableRow key={e.rank}>
                <Td>
                  <span className={cn(
                    "inline-grid h-7 w-7 place-items-center rounded-lg text-xs font-bold",
                    e.rank <= 3 ? "bg-[color:var(--gold)] text-[color:var(--primary-foreground)]" : "bg-surface ring-1 ring-border/60",
                  )}>
                    {e.rank}
                  </span>
                </Td>
                <Td className="font-sans font-medium">{e.name}</Td>
                <Td className="text-muted-foreground">{e.country}</Td>
                <Td mono className="text-right">{e.trades}</Td>
                <Td mono className={"text-right font-medium " + (e.roi >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>
                  {e.roi.toFixed(1)}%
                </Td>
                <Td mono className="text-right font-semibold">₹{e.pnl.toLocaleString()}</Td>
              </DataTableRow>
            ))}
          </tbody>
        </DataTable>
      </DataPanel>
    </PageShell>
  );
}
