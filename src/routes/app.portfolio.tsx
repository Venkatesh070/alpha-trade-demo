import { createFileRoute } from "@tanstack/react-router";
import { Sparkline } from "@/components/site/sparkline";
import { ALL_ASSETS, sparklineFor } from "@/data/markets";
import { AnimatedNumber } from "@/components/site/animated-number";

const HOLDINGS = [
  { sym: "BTC/USD", qty: 0.18, avg: 64200, alloc: 28 },
  { sym: "XAU/USD", qty: 5,    avg: 2380,  alloc: 22 },
  { sym: "EUR/USD", qty: 12,   avg: 1.08,  alloc: 14 },
  { sym: "AAPL",    qty: 25,   avg: 198,   alloc: 12 },
  { sym: "NIFTY50", qty: 3,    avg: 23800, alloc: 14 },
  { sym: "WTI",     qty: 30,   avg: 74.2,  alloc: 10 },
];

export const Route = createFileRoute("/app/portfolio")({
  component: PortfolioPage,
});

function PortfolioPage() {
  const totalEq = 1024520;
  const totalPnl = 24520;
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Portfolio</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glossy-soft rounded-xl p-4"><div className="text-xs text-muted-foreground">Equity</div><div className="mt-1 font-display text-xl font-bold"><AnimatedNumber value={totalEq} format={(n) => `₹${n.toLocaleString()}`} /></div></div>
        <div className="glossy-soft rounded-xl p-4"><div className="text-xs text-muted-foreground">P&amp;L (30d)</div><div className="mt-1 font-display text-xl font-bold text-[color:var(--success)]"><AnimatedNumber value={totalPnl} format={(n) => `+₹${n.toLocaleString()}`} /></div></div>
        <div className="glossy-soft rounded-xl p-4"><div className="text-xs text-muted-foreground">Positions</div><div className="mt-1 font-display text-xl font-bold">{HOLDINGS.length}</div></div>
      </div>

      <div className="glossy rounded-2xl p-5">
        <h2 className="font-display text-lg font-bold">Allocation</h2>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full">
          {HOLDINGS.map((h, i) => (
            <div key={h.sym} style={{ width: `${h.alloc}%`, background: ["#FACC15", "#22c55e", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"][i % 6] }} title={`${h.sym} ${h.alloc}%`} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {HOLDINGS.map((h, i) => (
            <span key={h.sym} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: ["#FACC15", "#22c55e", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"][i % 6] }} />{h.sym} · {h.alloc}%</span>
          ))}
        </div>
      </div>

      <div className="glossy overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Avg Price</th>
              <th className="px-4 py-3 text-right">Last</th>
              <th className="px-4 py-3 text-right">P&amp;L</th>
              <th className="px-4 py-3">Trend</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {HOLDINGS.map((h) => {
              const a = ALL_ASSETS.find((x) => x.symbol === h.sym)!;
              const pnl = (a.price - h.avg) * h.qty * 100;
              const up = pnl >= 0;
              return (
                <tr key={h.sym} className="border-t border-border/60">
                  <td className="px-4 py-3 font-semibold">{h.sym}</td>
                  <td className="px-4 py-3 text-right">{h.qty}</td>
                  <td className="px-4 py-3 text-right">{h.avg}</td>
                  <td className="px-4 py-3 text-right">{a.price}</td>
                  <td className={"px-4 py-3 text-right " + (up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>{up ? "+" : ""}{pnl.toFixed(2)}</td>
                  <td className="px-4 py-3"><Sparkline points={sparklineFor(h.sym)} up={up} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
