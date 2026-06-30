import { createFileRoute } from "@tanstack/react-router";
import { LEADERBOARD } from "@/data/content";

export const Route = createFileRoute("/app/leaderboards")({
  component: LeaderboardsPage,
});

function LeaderboardsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Leaderboards</h1>
      <p className="text-sm text-muted-foreground">Top 50 demo accounts by 30-day P&amp;L. Updated every minute.</p>
      <div className="glossy overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Trader</th><th className="px-4 py-3">Country</th><th className="px-4 py-3 text-right">Trades</th><th className="px-4 py-3 text-right">ROI</th><th className="px-4 py-3 text-right">P&amp;L</th></tr>
          </thead>
          <tbody className="font-mono">
            {LEADERBOARD.map((e) => (
              <tr key={e.rank} className="border-t border-border/60">
                <td className="px-4 py-2">
                  <span className={"inline-grid h-6 w-6 place-items-center rounded-full text-xs font-bold " + (e.rank <= 3 ? "bg-[color:var(--gold)] text-[color:var(--primary-foreground)]" : "bg-accent")}>{e.rank}</span>
                </td>
                <td className="px-4 py-2 font-sans">{e.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{e.country}</td>
                <td className="px-4 py-2 text-right">{e.trades}</td>
                <td className={"px-4 py-2 text-right " + (e.roi >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>{e.roi.toFixed(1)}%</td>
                <td className="px-4 py-2 text-right">₹{e.pnl.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
