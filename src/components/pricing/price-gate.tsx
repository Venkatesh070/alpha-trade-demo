import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/hooks/use-live-prices";
import { MIN_TRADING_BALANCE, useWallet } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";

export function usePriceAccess() {
  const { canTrade, balance } = useWallet();
  return {
    canViewPrices: canTrade,
    balance,
    minBalance: MIN_TRADING_BALANCE,
  };
}

export function MaskedPriceValue({
  className,
  align = "right",
  showLock = true,
}: {
  className?: string;
  align?: "left" | "right";
  showLock?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        align === "right" && "justify-end",
        align === "left" && "justify-start",
        className,
      )}
    >
      {showLock && <Lock className="h-3.5 w-3.5 shrink-0 text-[color:var(--gold)]" />}
      <div className={cn("select-none font-mono", align === "right" && "text-right")}>
        <div className="text-xs text-muted-foreground/40 blur-[3px]">00000.00</div>
        <div className="text-[10px] text-muted-foreground">—.—%</div>
      </div>
    </div>
  );
}

export function GatedPrice({
  asset,
  price,
  changePct,
  showChange = true,
  className,
  align = "right",
  priceClassName,
  changeClassName,
}: {
  asset: Parameters<typeof formatPrice>[0];
  price: number;
  changePct: number;
  showChange?: boolean;
  className?: string;
  align?: "left" | "right";
  priceClassName?: string;
  changeClassName?: string;
}) {
  const { canViewPrices } = usePriceAccess();

  if (!canViewPrices) {
    return <MaskedPriceValue className={className} align={align} />;
  }

  const up = changePct >= 0;

  return (
    <div className={cn(align === "right" && "text-right", "font-mono text-xs", className)}>
      <div className={cn("text-foreground", priceClassName)}>{formatPrice(asset, price)}</div>
      {showChange && (
        <div
          className={cn(
            up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]",
            changeClassName,
          )}
        >
          {up ? "+" : ""}
          {changePct.toFixed(2)}%
        </div>
      )}
    </div>
  );
}

export function GatedPriceText({
  asset,
  price,
  className,
}: {
  asset: Parameters<typeof formatPrice>[0];
  price: number;
  className?: string;
}) {
  const { canViewPrices } = usePriceAccess();

  if (!canViewPrices) {
    return (
      <span className={cn("inline-flex items-center gap-1 font-mono text-muted-foreground", className)}>
        <Lock className="h-3 w-3 text-[color:var(--gold)]" />
        <span className="blur-[3px] select-none">00000.00</span>
      </span>
    );
  }

  return <span className={cn("font-mono", className)}>{formatPrice(asset, price)}</span>;
}

export function GatedChange({
  changePct,
  className,
  align = "right",
}: {
  changePct: number;
  className?: string;
  align?: "left" | "right";
}) {
  const { canViewPrices } = usePriceAccess();
  const up = changePct >= 0;

  if (!canViewPrices) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-mono text-xs text-muted-foreground",
          align === "right" && "justify-end",
          className,
        )}
      >
        <Lock className="h-3 w-3 text-[color:var(--gold)]" />
        —.—%
      </span>
    );
  }

  return (
    <span
      className={cn(
        "font-mono text-sm",
        up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]",
        align === "right" && "text-right",
        className,
      )}
    >
      {up ? "+" : ""}
      {changePct.toFixed(2)}%
    </span>
  );
}

export function GatedNumber({
  value,
  className,
  prefix = "",
}: {
  value: string | number;
  className?: string;
  prefix?: string;
}) {
  const { canViewPrices } = usePriceAccess();

  if (!canViewPrices) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-mono text-xs text-muted-foreground",
          className,
        )}
      >
        <Lock className="h-3 w-3 text-[color:var(--gold)]" />
        <span className="blur-[2px] select-none">0000</span>
      </span>
    );
  }

  return (
    <span className={cn("font-mono", className)}>
      {prefix}
      {value}
    </span>
  );
}

export function PriceLockBanner({ className }: { className?: string }) {
  const { canViewPrices, minBalance } = usePriceAccess();
  if (canViewPrices) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 sm:px-5 sm:py-3.5",
        "border-[color:var(--gold)]/25 bg-[color:var(--gold)]/10",
        "dark:border-[color:var(--gold)]/30 dark:bg-[color:var(--gold)]/8",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 text-sm">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--gold)]/20 dark:bg-[color:var(--gold)]/15">
          <Lock className="h-4 w-4 text-[color:var(--gold-deep)] dark:text-[color:var(--gold)]" />
        </span>
        <span className="text-foreground/80 dark:text-muted-foreground">
          Deposit <strong className="text-foreground">₹{minBalance.toLocaleString()}</strong> to
          unlock live market prices
        </span>
      </div>
      <Button asChild size="sm" className="gold-button hover:gold-button-hover shrink-0">
        <Link to="/app/wallet/deposit">Deposit funds</Link>
      </Button>
    </div>
  );
}

export function PriceLockInline({ className }: { className?: string }) {
  const { canViewPrices } = usePriceAccess();
  if (canViewPrices) return null;

  return (
    <Button
      asChild
      size="sm"
      className={cn("h-7 gap-1.5 px-2.5 text-xs font-semibold", className)}
    >
      <Link to="/app/wallet/deposit">
        <Lock className="h-3 w-3" />
        Deposit
      </Link>
    </Button>
  );
}
