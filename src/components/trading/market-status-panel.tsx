import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import type { Asset } from "@/data/markets";
import { formatPrice } from "@/hooks/use-live-prices";
import { useWallet } from "@/hooks/use-wallet";
import { useTrading } from "@/hooks/use-trading";
import { usePriceAccess } from "@/components/pricing/price-gate";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  XM_BORDER,
  XM_CHART_BG,
  XM_STATUS_PANEL_W,
  XM_TEXT,
} from "@/lib/xm-trading-tokens";

function amountLabel(asset: Asset, qtyTab: "quantity" | "lots", qty: string) {
  const n = qty || "1";
  if (qtyTab === "lots") return `${n} Lot(s)`;
  if (asset.category === "metals" || asset.symbol.includes("XAU") || asset.symbol.includes("GOLD")) {
    return `${n} Troy Ounce(s)`;
  }
  if (asset.category === "forex") return `${n} Lot(s)`;
  return `${n} Unit(s)`;
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex rounded-lg bg-muted/60 p-0.5">
      {options.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
            value === id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function MarketStatusSidePanel({ asset, price }: { asset: Asset; price: number }) {
  const { canViewPrices } = usePriceAccess();
  const { canTrade, balance } = useWallet();
  const { placeOrder } = useTrading();
  const spread = asset.spread ?? 2;
  const pip = asset.category === "crypto" ? price * 0.0001 : 0.0001;
  const ask = price + spread * pip;
  const bid = price - spread * pip;
  const spreadDisplay = spread * pip;
  const fmt = (n: number) => (canViewPrices ? formatPrice(asset, n) : "—.—");

  const [oneClick, setOneClick] = useState(false);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qtyTab, setQtyTab] = useState<"quantity" | "lots">("quantity");
  const [qty, setQty] = useState("1");
  const [conditionalOrder, setConditionalOrder] = useState(true);
  const [limitPrice, setLimitPrice] = useState(() => fmt(ask - spreadDisplay));
  const [goodUntilCancelled, setGoodUntilCancelled] = useState(true);
  const [tpSl, setTpSl] = useState(true);
  const [tpSlTab, setTpSlTab] = useState<"price" | "amount">("amount");
  const [tpAmount, setTpAmount] = useState("");
  const [slAmount, setSlAmount] = useState("");

  const isBuy = side === "buy";
  const accentClass = isBuy ? "bg-[color:var(--success)]" : "bg-[color:var(--destructive)]";
  const switchChecked = "data-[state=checked]:bg-[color:var(--success)]";
  const marketPrice = isBuy ? ask : bid;

  const q = Number(qty) || 0;
  const marginNeeded = useMemo(
    () => (q * price) / (asset.leverage ?? 200),
    [q, price, asset.leverage],
  );
  const marginPct = balance > 0 ? Math.min(100, (marginNeeded / balance) * 100) : 0;
  const orderPrice = conditionalOrder
    ? Number(limitPrice.replace(/,/g, "")) || marketPrice
    : marketPrice;
  const insufficientMargin = canTrade && marginNeeded > balance;

  const selectSide = (next: "buy" | "sell") => {
    setSide(next);
    setLimitPrice(fmt(next === "buy" ? ask - spreadDisplay : bid + spreadDisplay));
    if (oneClick) place(next);
  };

  const place = (orderSide: "buy" | "sell") => {
    if (!canTrade) {
      toast.error("Deposit to unlock trading");
      return;
    }
    if (!q || q <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (insufficientMargin) {
      toast.error("Insufficient margin");
      return;
    }
    const px =
      orderSide === "buy"
        ? conditionalOrder
          ? orderPrice
          : ask
        : conditionalOrder
          ? orderPrice
          : bid;
    placeOrder({
      symbol: asset.symbol,
      side: orderSide,
      qty: q,
      type: conditionalOrder ? "limit" : "market",
      price: px,
      sl: slAmount ? Number(slAmount) : undefined,
      tp: tpAmount ? Number(tpAmount) : undefined,
    });
    toast.success(`${orderSide.toUpperCase()} ${amountLabel(asset, qtyTab, qty)} @ ${fmt(px)}`);
  };

  return (
    <aside
      className="flex h-full shrink-0 flex-col overflow-y-auto border-l"
      style={{
        width: XM_STATUS_PANEL_W,
        borderColor: XM_BORDER,
        background: XM_CHART_BG,
      }}
    >
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: XM_BORDER }}>
        <span className="text-sm font-semibold" style={{ color: XM_TEXT }}>
          One Click Order
        </span>
        <Switch
          checked={oneClick}
          onCheckedChange={setOneClick}
          className={switchChecked}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-1">
          <button
            type="button"
            disabled={!canTrade}
            onClick={() => selectSide("sell")}
            className={cn(
              "flex flex-col items-center justify-center rounded-l-xl px-2 py-3 transition disabled:opacity-50",
              side === "sell"
                ? "bg-[color:var(--destructive)] text-white hover:brightness-110"
                : "bg-muted/50 hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wide",
                side === "sell" ? "opacity-90" : "text-muted-foreground",
              )}
            >
              Sell
            </span>
            <span
              className={cn(
                "mt-0.5 font-mono text-[15px] font-bold tabular-nums",
                side === "sell" ? "text-white" : "",
              )}
              style={side === "sell" ? undefined : { color: XM_TEXT }}
            >
              {fmt(bid)}
            </span>
          </button>

          <div className="flex min-w-[2.75rem] flex-col items-center justify-center rounded-md border bg-background px-1.5 py-2">
            <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
              {canViewPrices ? spreadDisplay.toFixed(2) : "—.—"}
            </span>
          </div>

          <button
            type="button"
            disabled={!canTrade}
            onClick={() => selectSide("buy")}
            className={cn(
              "flex flex-col items-center justify-center rounded-r-xl px-2 py-3 transition disabled:opacity-50",
              side === "buy"
                ? "bg-[color:var(--success)] text-white hover:brightness-110"
                : "bg-muted/50 hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wide",
                side === "buy" ? "opacity-90" : "text-muted-foreground",
              )}
            >
              Buy
            </span>
            <span
              className={cn(
                "mt-0.5 font-mono text-[15px] font-bold tabular-nums",
                side === "buy" ? "text-white" : "",
              )}
              style={side === "buy" ? undefined : { color: XM_TEXT }}
            >
              {fmt(ask)}
            </span>
          </button>
        </div>

        <Segmented
          options={[
            { id: "quantity", label: "Quantity" },
            { id: "lots", label: "Lots" },
          ]}
          value={qtyTab}
          onChange={(id) => setQtyTab(id as "quantity" | "lots")}
        />

        <div className="rounded-xl border bg-muted/30 px-3 py-2.5" style={{ borderColor: XM_BORDER }}>
          <p className="text-[11px] text-muted-foreground">Amount</p>
          <Input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            disabled={!canTrade}
            className="mt-1 h-auto border-0 bg-transparent p-0 text-lg font-semibold shadow-none focus-visible:ring-0"
          />
          <p className="text-sm text-muted-foreground">{amountLabel(asset, qtyTab, qty)}</p>
        </div>

        <div>
          <div className="flex items-baseline justify-between text-[11px]">
            <span className="text-muted-foreground">
              Required Margin{" "}
              <span className="font-mono font-semibold tabular-nums text-foreground">
                $ {marginNeeded.toFixed(2)}
              </span>
            </span>
            <span className="font-mono tabular-nums text-muted-foreground">{marginPct.toFixed(0)}%</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", accentClass)}
              style={{ width: `${marginPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border p-3" style={{ borderColor: XM_BORDER }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: XM_TEXT }}>
              {isBuy ? "Buy When Price is" : "Sell When Price is"}
            </span>
            <Switch
              checked={conditionalOrder}
              onCheckedChange={setConditionalOrder}
              disabled={!canTrade}
              className={switchChecked}
            />
          </div>

          {conditionalOrder && (
            <div className="mt-3 space-y-2">
              <div className="rounded-lg border bg-muted/30 px-3 py-2" style={{ borderColor: XM_BORDER }}>
                <p className="text-[11px] text-muted-foreground">Price</p>
                <Input
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  disabled={!canTrade}
                  className="mt-0.5 h-auto border-0 bg-transparent p-0 font-mono text-base font-semibold shadow-none focus-visible:ring-0"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Current {isBuy ? "Buy" : "Sell"} Price:{" "}
                <span className="font-mono font-medium tabular-nums text-foreground">{fmt(marketPrice)}</span>
              </p>
              <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: XM_BORDER }}>
                <span className="text-xs text-muted-foreground">Good Until Cancelled</span>
                <Switch
                  checked={goodUntilCancelled}
                  onCheckedChange={setGoodUntilCancelled}
                  disabled={!canTrade}
                  className={switchChecked}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border p-3" style={{ borderColor: XM_BORDER }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: XM_TEXT }}>
              TP/SL
            </span>
            <Switch
              checked={tpSl}
              onCheckedChange={setTpSl}
              disabled={!canTrade}
              className={switchChecked}
            />
          </div>

          {tpSl && (
            <div className="mt-3 space-y-2">
              <Segmented
                options={[
                  { id: "price", label: "Price" },
                  { id: "amount", label: "Amount" },
                ]}
                value={tpSlTab}
                onChange={(id) => setTpSlTab(id as "price" | "amount")}
              />
              <p className="text-[10px] leading-snug text-muted-foreground">
                Final amounts may differ from the input values.
              </p>
              <div className="rounded-lg border bg-muted/30 px-3 py-2.5" style={{ borderColor: XM_BORDER }}>
                <Input
                  value={tpAmount}
                  onChange={(e) => setTpAmount(e.target.value)}
                  disabled={!canTrade}
                  placeholder={tpSlTab === "amount" ? "Take Profit Amount" : "Take Profit Price"}
                  className="h-auto border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2.5" style={{ borderColor: XM_BORDER }}>
                <Input
                  value={slAmount}
                  onChange={(e) => setSlAmount(e.target.value)}
                  disabled={!canTrade}
                  placeholder={tpSlTab === "amount" ? "Stop Loss Amount" : "Stop Loss Price"}
                  className="h-auto border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
            </div>
          )}
        </div>

        {insufficientMargin && (
          <p className="text-xs text-[color:var(--destructive)]">
            You don&apos;t have enough margin to place this order.
          </p>
        )}

        <button
          type="button"
          disabled={!canTrade || insufficientMargin}
          onClick={() => place(side)}
          className={cn(
            "relative mt-auto flex w-full flex-col items-center justify-center rounded-xl px-4 py-3.5 text-white transition hover:brightness-110 disabled:opacity-50",
            accentClass,
          )}
        >
          <span className="text-sm font-semibold">Place Order at</span>
          <span className="font-mono text-lg font-bold tabular-nums">{fmt(orderPrice)}</span>
          <ArrowUpRight className="absolute bottom-2.5 right-2.5 h-4 w-4 opacity-90" />
        </button>
      </div>
    </aside>
  );
}
