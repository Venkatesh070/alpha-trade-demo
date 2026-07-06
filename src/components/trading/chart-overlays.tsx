import type { Asset } from "@/data/markets";
import { formatPrice } from "@/hooks/use-live-prices";
import { usePriceAccess } from "@/components/pricing/price-gate";
import { cn } from "@/lib/utils";
import { XM_DOWN, XM_ICON, XM_TEXT, XM_UP } from "@/lib/xm-trading-tokens";
import { Lock } from "lucide-react";

export function ChartOhlcOverlay({
  asset,
  price,
  changePct,
  bid,
  ask,
  spread,
}: {
  asset: Asset;
  price: number;
  changePct: number;
  bid: number;
  ask: number;
  spread: number;
}) {
  const { canViewPrices } = usePriceAccess();
  const up = changePct >= 0;
  const shortName = asset.symbol.split("/")[0];
  const o = price * 0.9998;
  const h = price * 1.0001;
  const l = price * 0.9997;
  const c = price;
  const fmt = (n: number) => (canViewPrices ? formatPrice(asset, n) : "—.—");

  return (
    <div className="pointer-events-none absolute left-3 top-2 z-10">
      <div className="text-[11px] leading-relaxed" style={{ color: XM_ICON }}>
        <span className="font-medium" style={{ color: XM_TEXT }}>{shortName}</span>
        <span className="mx-1">·</span>
        <span>1</span>
        {canViewPrices ? (
          <span className="mx-2 font-mono tabular-nums">
            O {fmt(o)} H {fmt(h)} L {fmt(l)} C {fmt(c)}
          </span>
        ) : (
          <span className="mx-2 inline-flex items-center gap-1 font-mono tabular-nums text-muted-foreground">
            <Lock className="h-3 w-3 text-[color:var(--gold)]" />
            <span className="blur-[3px] select-none">O — H — L — C —</span>
          </span>
        )}
        <span
          className={cn(
            "font-mono tabular-nums",
            canViewPrices
              ? up
                ? "text-success"
                : "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {canViewPrices ? (
            <>
              {up ? "+" : ""}
              {(price * (changePct / 100)).toFixed(2)} ({up ? "+" : ""}
              {changePct.toFixed(2)}%)
            </>
          ) : (
            "—.— (—.—%)"
          )}
        </span>
      </div>

      <div className="pointer-events-auto mt-1.5 flex items-stretch overflow-hidden rounded-md shadow-lg">
        <button
          type="button"
          className="flex min-w-[88px] flex-col items-center px-3 py-1 text-white"
          style={{ background: XM_DOWN }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">Sell</span>
          <span className="font-mono text-[13px] font-bold tabular-nums">{fmt(bid)}</span>
        </button>
        <div className="flex min-w-[44px] flex-col items-center justify-center bg-muted px-2 py-1 text-muted-foreground">
          <span className="font-mono text-[11px] tabular-nums">
            {canViewPrices ? spread.toFixed(2) : "—.—"}
          </span>
        </div>
        <button
          type="button"
          className="flex min-w-[88px] flex-col items-center px-3 py-1 text-white"
          style={{ background: XM_UP }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">Buy</span>
          <span className="font-mono text-[13px] font-bold tabular-nums">{fmt(ask)}</span>
        </button>
      </div>
    </div>
  );
}

export function TradingViewWatermark() {
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-10 text-muted-foreground opacity-40">
      <svg viewBox="0 0 36 28" className="h-7 w-9" aria-hidden>
        <text x="0" y="20" fill="currentColor" className="text-muted-foreground" fontSize="16" fontWeight="700" fontFamily="sans-serif">
          TV
        </text>
      </svg>
    </div>
  );
}
