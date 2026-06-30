import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface OpenOrder {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  type: string;
  price: number;
  pnl: number;
  openedAt: number;
}

export function OrdersTable({ orders, onClose }: { orders: OpenOrder[]; onClose?: (id: string) => void }) {
  if (!orders.length) {
    return <div className="grid h-full place-items-center p-8 text-center text-sm text-muted-foreground">No open positions yet. Place a trade from the right panel.</div>;
  }
  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-surface/95 backdrop-blur text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left">Symbol</th>
            <th className="px-3 py-2 text-left">Side</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2 text-right">Price</th>
            <th className="px-3 py-2 text-right">P&amp;L</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-border/60 hover:bg-accent/40">
              <td className="px-3 py-2 font-semibold">{o.symbol}</td>
              <td className={cn("px-3 py-2 uppercase", o.side === "buy" ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>{o.side}</td>
              <td className="px-3 py-2 text-right">{o.qty}</td>
              <td className="px-3 py-2 text-right">{o.price.toFixed(4)}</td>
              <td className={cn("px-3 py-2 text-right", o.pnl >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>{o.pnl >= 0 ? "+" : ""}{o.pnl.toFixed(2)}</td>
              <td className="px-3 py-2 capitalize text-muted-foreground">{o.type}</td>
              <td className="px-3 py-2 text-right">
                {onClose && (
                  <Button size="sm" variant="ghost" onClick={() => onClose(o.id)} className="h-7 px-2">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
