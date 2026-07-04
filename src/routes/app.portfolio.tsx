import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { Sparkline } from "@/components/site/sparkline";
import { AnimatedNumber } from "@/components/site/animated-number";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataPanel } from "@/components/dashboard/data-panel";
import { DataTable, DataTableHead, DataTableRow, Th, Td } from "@/components/dashboard/data-table";
import { ALL_ASSETS, sparklineFor } from "@/data/markets";
import { GatedNumber, PriceLockBanner } from "@/components/pricing/price-gate";

const HOLDINGS = [
  { sym: "BTC/USD", qty: 0.18, avg: 64200, alloc: 28 },
  { sym: "XAU/USD", qty: 5, avg: 2380, alloc: 22 },
  { sym: "EUR/USD", qty: 12, avg: 1.08, alloc: 14 },
  { sym: "AAPL", qty: 25, avg: 198, alloc: 12 },
  { sym: "NIFTY50", qty: 3, avg: 23800, alloc: 14 },
  { sym: "WTI", qty: 30, avg: 74.2, alloc: 10 },
];

const COLORS = ["#FACC15", "#22c55e", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];

export const Route = createFileRoute("/app/portfolio")({
  component: PortfolioPage,
});

function PortfolioPage() {
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
          value={<AnimatedNumber value={1024520} format={(n) => `₹${n.toLocaleString()}`} />}
          icon={Briefcase}
        />
        <StatCard
          label="P&L (30d)"
          accent="var(--success)"
          value={<AnimatedNumber value={24520} format={(n) => `+₹${n.toLocaleString()}`} />}
        />
        <StatCard label="Open positions" value={HOLDINGS.length} sub="Across 6 instruments" />
      </div>

      <DataPanel title="Asset allocation" description="Portfolio weight by instrument">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-surface">
          {HOLDINGS.map((h, i) => (
            <div
              key={h.sym}
              style={{ width: `${h.alloc}%`, background: COLORS[i % 6] }}
              title={`${h.sym} ${h.alloc}%`}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {HOLDINGS.map((h, i) => (
            <span key={h.sym} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % 6] }} />
              {h.sym} · {h.alloc}%
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
            {HOLDINGS.map((h) => {
              const a = ALL_ASSETS.find((x) => x.symbol === h.sym)!;
              const pnl = (a.price - h.avg) * h.qty * 100;
              const up = pnl >= 0;
              return (
                <DataTableRow key={h.sym}>
                  <Td className="font-sans font-semibold">{h.sym}</Td>
                  <Td mono className="text-right">
                    {h.qty}
                  </Td>
                  <Td mono className="text-right">
                    <GatedNumber value={h.avg} />
                  </Td>
                  <Td mono className="text-right">
                    <GatedNumber value={a.price} />
                  </Td>
                  <Td
                    mono
                    className={
                      "text-right font-medium " +
                      (up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")
                    }
                  >
                    <GatedNumber
                      value={pnl.toFixed(2)}
                      prefix={up ? "+" : ""}
                      className={
                        up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]"
                      }
                    />
                  </Td>
                  <Td>
                    <Sparkline points={sparklineFor(h.sym)} up={up} className="w-24" />
                  </Td>
                </DataTableRow>
              );
            })}
          </tbody>
        </DataTable>
      </DataPanel>
    </PageShell>
  );
}
