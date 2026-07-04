import { useLivePrices, formatPrice } from "@/hooks/use-live-prices";
import { ALL_ASSETS } from "@/data/markets";
import { usePriceAccess } from "@/components/pricing/price-gate";
import { ArrowDownRight, ArrowUpRight, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Ticker() {
  const live = useLivePrices(2500);
  const { canViewPrices, minBalance } = usePriceAccess();
  const items = ALL_ASSETS.slice(0, 16);

  if (!canViewPrices) {
    const lockedRow = (
      <div className="flex items-center gap-10 px-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <Lock className="h-3.5 w-3.5 text-[color:var(--gold)]" />
            <span className="text-muted-foreground">
              Deposit ₹{minBalance.toLocaleString()} to unlock live prices
            </span>
            <Link
              to="/app/wallet/deposit"
              className="rounded-md bg-[color:var(--gold)]/15 px-2.5 py-0.5 text-xs font-semibold text-[color:var(--gold)] hover:bg-[color:var(--gold)]/25"
            >
              Deposit
            </Link>
          </div>
        ))}
      </div>
    );

    return (
      <div className="relative overflow-hidden border-y border-border/60 bg-surface/40 backdrop-blur">
        <div className="flex w-max marquee">
          {lockedRow}
          {lockedRow}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
      </div>
    );
  }

  const row = (
    <div className="flex items-center gap-8 px-6">
      {items.map((a) => {
        const p = live[a.symbol];
        const up = (p?.changePct ?? a.changePct) >= 0;
        return (
          <div key={a.symbol} className="flex items-center gap-2 text-sm font-mono">
            <span className="text-muted-foreground">{a.symbol}</span>
            <span className="font-semibold text-foreground">
              {formatPrice(a, p?.price ?? a.price)}
            </span>
            <span
              className={
                up
                  ? "text-[color:var(--success)] inline-flex items-center"
                  : "text-[color:var(--destructive)] inline-flex items-center"
              }
            >
              {up ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {(p?.changePct ?? a.changePct).toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-surface/40 backdrop-blur">
      <div className="flex w-max marquee">
        {row}
        {row}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
