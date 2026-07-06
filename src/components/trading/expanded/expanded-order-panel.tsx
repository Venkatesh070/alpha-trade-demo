import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAsset } from "@/data/markets";
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices";
import { useWallet } from "@/hooks/use-wallet";

type OrderType = "market" | "limit" | "stop";

export function ExpandedOrderPanel({
  symbol,
  onPlace,
  disabled,
}: {
  symbol: string;
  onPlace: (o: {
    side: "buy" | "sell";
    qty: number;
    type: OrderType;
    price: number;
    symbol: string;
  }) => void;
  disabled?: boolean;
}) {
  const asset = getAsset(symbol);
  const live = useLivePrices(2000);
  const { balance } = useWallet();
  const price = live[symbol]?.price ?? asset?.price ?? 100;
  const spread = asset?.spread ?? 2;
  const pip = asset?.category === "crypto" ? price * 0.0001 : 0.0001;
  const ask = price + spread * pip;
  const bid = price - spread * pip;

  const [oneClick, setOneClick] = useState(true);
  const [qtyTab, setQtyTab] = useState<"quantity" | "lots">("quantity");
  const [qty, setQty] = useState("1");
  const [tpSl, setTpSl] = useState(false);
  const [buyWhen, setBuyWhen] = useState(false);

  if (!asset) return null;

  const q = Number(qty) || 0;
  const marginNeeded = (q * price) / (asset.leverage ?? 200);
  const insufficientMargin = !disabled && marginNeeded > balance;

  const place = (side: "buy" | "sell") => {
    if (disabled) return;
    if (!q || q <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (insufficientMargin) {
      toast.error("Insufficient margin");
      return;
    }
    const px = side === "buy" ? ask : bid;
    onPlace({ symbol, side, qty: q, type: "market", price: px });
    toast.success(`${side.toUpperCase()} ${q} ${symbol}`);
  };

  return (
    <aside className="flex w-[280px] shrink-0 flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <span className="text-sm font-semibold text-foreground">One Click Order</span>
        <Switch checked={oneClick} onCheckedChange={setOneClick} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => place("sell")}
            className="flex flex-col items-center justify-center rounded-lg border border-[color:var(--destructive)]/20 bg-[color:var(--destructive)]/8 px-2 py-3.5 transition hover:bg-[color:var(--destructive)]/15 disabled:opacity-50"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--destructive)]">
              Sell
            </span>
            <span className="mt-1 font-mono text-base font-bold tabular-nums text-foreground">
              {formatPrice(asset, bid)}
            </span>
          </button>

          <div className="flex min-w-[3rem] flex-col items-center justify-center rounded-md border border-border/60 bg-surface px-2 py-3">
            <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
              {(spread * 10).toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => place("buy")}
            className="flex flex-col items-center justify-center rounded-lg border border-[color:var(--buy)]/25 bg-[color:var(--buy)]/10 px-2 py-3.5 transition hover:bg-[color:var(--buy)]/18 disabled:opacity-50"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--buy)]">
              Buy
            </span>
            <span className="mt-1 font-mono text-base font-bold tabular-nums text-[color:var(--buy)]">
              {formatPrice(asset, ask)}
            </span>
          </button>
        </div>

        <div className="mt-4 flex rounded-lg border border-border bg-surface p-0.5">
          {(["quantity", "lots"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setQtyTab(t)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-medium capitalize transition-colors",
                qtyTab === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label className="text-[11px] font-medium text-muted-foreground">Amount</label>
          <Input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            disabled={disabled}
            className="mt-1 font-mono"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {qtyTab === "quantity" ? `${qty || 0} Unit(s)` : `${qty || 0} Lot(s)`}
          </p>
        </div>

        {insufficientMargin && (
          <p className="mt-3 text-xs text-[color:var(--destructive)]">
            You don&apos;t have enough margin to place this order.
          </p>
        )}

        <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Buy When Price Is</span>
            <Switch checked={buyWhen} onCheckedChange={setBuyWhen} disabled={disabled} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">TP/SL</span>
            <Switch checked={tpSl} onCheckedChange={setTpSl} disabled={disabled} />
          </div>
        </div>

        <Button
          type="button"
          disabled={disabled || insufficientMargin}
          onClick={() => place("buy")}
          className="mt-auto h-11 w-full gap-2 bg-[color:var(--buy)] text-sm font-bold text-[color:var(--buy-foreground)] hover:brightness-110"
        >
          Place Order at {formatPrice(asset, ask)}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
