import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getAsset } from "@/data/markets";
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices";

type OrderType = "market" | "limit" | "stop";

export function OrderPanel({ symbol, onPlace, disabled }: { symbol: string; onPlace: (o: { side: "buy" | "sell"; qty: number; type: OrderType; price: number; symbol: string; tp?: number; sl?: number }) => void; disabled?: boolean }) {
  const asset = getAsset(symbol);
  const live = useLivePrices(2000);
  const price = live[symbol]?.price ?? asset?.price ?? 100;

  const [type, setType] = useState<OrderType>("market");
  const [qty, setQty] = useState("0.10");
  const [leverage, setLeverage] = useState(asset?.leverage ?? 200);
  const [limit, setLimit] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");

  if (!asset) return null;

  const submit = (side: "buy" | "sell") => {
    if (disabled) return;
    const q = Number(qty);
    if (!q || q <= 0) { toast.error("Enter a valid quantity"); return; }
    const px = type === "market" ? price : Number(limit || price);
    onPlace({ symbol, side, qty: q, type, price: px, tp: tp ? Number(tp) : undefined, sl: sl ? Number(sl) : undefined });
    toast.success(`${side.toUpperCase()} ${q} ${symbol} @ ${formatPrice(asset, px)}`, { description: `${type.toUpperCase()} • leverage 1:${leverage}` });
  };

  return (
    <div className={cn("flex h-full flex-col gap-3 p-3", disabled && "pointer-events-none opacity-60")}>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Order</div>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="font-display text-lg font-bold">{symbol}</div>
          <div className="font-mono text-sm">{formatPrice(asset, price)}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 rounded-md border border-border bg-surface p-1 text-xs">
        {(["market", "limit", "stop"] as OrderType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn("rounded px-2 py-1.5 font-medium capitalize transition-colors", type === t ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {t}
          </button>
        ))}
      </div>

      {type !== "market" && (
        <div>
          <Label className="text-xs text-muted-foreground">Price</Label>
          <Input value={limit} onChange={(e) => setLimit(e.target.value)} placeholder={String(formatPrice(asset, price))} className="font-mono" />
        </div>
      )}

      <div>
        <Label className="text-xs text-muted-foreground">Quantity (lots)</Label>
        <Input value={qty} onChange={(e) => setQty(e.target.value)} className="font-mono" />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Leverage 1:{leverage}</Label>
        <input
          type="range"
          min={1}
          max={asset.leverage}
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="mt-2 w-full accent-[color:var(--gold)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Take Profit</Label>
          <Input value={tp} onChange={(e) => setTp(e.target.value)} placeholder="—" className="font-mono" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Stop Loss</Label>
          <Input value={sl} onChange={(e) => setSl(e.target.value)} placeholder="—" className="font-mono" />
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
        <Button onClick={() => submit("sell")} className="bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] hover:brightness-110">Sell</Button>
        <Button onClick={() => submit("buy")} className="bg-[color:var(--success)] text-[color:var(--success-foreground)] hover:brightness-110">Buy</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-surface px-3 py-2 text-[11px] text-muted-foreground">
        <div>Spread<div className="font-mono text-foreground">{asset.spread} pips</div></div>
        <div>Margin<div className="font-mono text-foreground">≈ {(Number(qty || 0) * price / leverage).toFixed(2)}</div></div>
      </div>
    </div>
  );
}
