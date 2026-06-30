import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/history")({
  component: HistoryPage,
});

const HIST = Array.from({ length: 18 }, (_, i) => {
  const syms = ["XAU/USD", "BTC/USD", "EUR/USD", "AAPL", "NIFTY50", "WTI"];
  const sides = ["BUY", "SELL"];
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
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Trade history</h1>
      <div className="glossy overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Symbol</th><th className="px-4 py-3">Side</th><th className="px-4 py-3 text-right">Qty</th><th className="px-4 py-3 text-right">Open</th><th className="px-4 py-3 text-right">Close</th><th className="px-4 py-3 text-right">P&amp;L</th><th className="px-4 py-3">Closed</th></tr>
          </thead>
          <tbody className="font-mono">
            {HIST.map((h) => (
              <tr key={h.id} className="border-t border-border/60">
                <td className="px-4 py-3 font-semibold">{h.sym}</td>
                <td className={"px-4 py-3 " + (h.side === "BUY" ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>{h.side}</td>
                <td className="px-4 py-3 text-right">{h.qty}</td>
                <td className="px-4 py-3 text-right">{h.open}</td>
                <td className="px-4 py-3 text-right">{h.close}</td>
                <td className={"px-4 py-3 text-right " + (h.pnl >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>{h.pnl >= 0 ? "+" : ""}{h.pnl.toFixed(2)}</td>
                <td className="px-4 py-3 font-sans text-muted-foreground">{h.closed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
