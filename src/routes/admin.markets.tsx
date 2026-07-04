import { createFileRoute } from "@tanstack/react-router";
import { ALL_ASSETS } from "@/data/markets";

export const Route = createFileRoute("/admin/markets")({ component: AdminMarkets });

function AdminMarkets() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="font-display text-2xl font-bold">Markets · Price manager</h1>
      <p className="text-sm text-muted-foreground">
        Override seed prices for the simulated feed. Demo only.
      </p>
      <div className="glossy overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Seed price</th>
              <th className="px-4 py-3 text-right">Spread</th>
              <th className="px-4 py-3 text-right">Leverage</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {ALL_ASSETS.map((a) => (
              <tr key={a.symbol} className="border-t border-border/60">
                <td className="px-4 py-2 font-semibold">{a.symbol}</td>
                <td className="px-4 py-2 capitalize text-muted-foreground">{a.category}</td>
                <td className="px-4 py-2 text-right">{a.price}</td>
                <td className="px-4 py-2 text-right">{a.spread}</td>
                <td className="px-4 py-2 text-right">1:{a.leverage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
