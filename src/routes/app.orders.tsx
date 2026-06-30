import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/orders")({
  component: OrdersPage,
});

const OPEN = [
  { id: "o1", sym: "XAU/USD", side: "BUY",  qty: 0.10, price: 2412.55, sl: 2400, tp: 2440, pnl:  18.42, opened: "2m ago" },
  { id: "o2", sym: "EUR/USD", side: "SELL", qty: 0.50, price: 1.0842,  sl: 1.0890, tp: 1.0780, pnl:  -6.20, opened: "14m ago" },
  { id: "o3", sym: "BTC/USD", side: "BUY",  qty: 0.01, price: 68420,   sl: 67800, tp: 69500, pnl:  84.10, opened: "1h ago" },
  { id: "o4", sym: "NAS100",  side: "BUY",  qty: 1.0,  price: 19542,   sl: 19400, tp: 19800, pnl:  24.00, opened: "3h ago" },
];

function OrdersPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Open orders</h1>
        <Link to="/trading" className="gold-button hover:gold-button-hover rounded-md px-4 py-2 text-sm font-semibold">New trade</Link>
      </div>
      <div className="glossy overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Symbol</th><th className="px-4 py-3">Side</th><th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Open</th><th className="px-4 py-3 text-right">SL</th><th className="px-4 py-3 text-right">TP</th>
              <th className="px-4 py-3 text-right">P&amp;L</th><th className="px-4 py-3">Opened</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {OPEN.map((o) => (
              <tr key={o.id} className="border-t border-border/60">
                <td className="px-4 py-3 font-semibold">{o.sym}</td>
                <td className={"px-4 py-3 " + (o.side === "BUY" ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>{o.side}</td>
                <td className="px-4 py-3 text-right">{o.qty}</td>
                <td className="px-4 py-3 text-right">{o.price}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{o.sl}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{o.tp}</td>
                <td className={"px-4 py-3 text-right " + (o.pnl >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>{o.pnl >= 0 ? "+" : ""}{o.pnl.toFixed(2)}</td>
                <td className="px-4 py-3 font-sans text-muted-foreground">{o.opened}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
