import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
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

export const DEPOSIT_UNLOCK_MESSAGE =
  "Deposit the amount to start trading and unlock all features.";

export function depositUnlockText() {
  return DEPOSIT_UNLOCK_MESSAGE;
}

export function DepositButton({
  className,
  size = "sm",
  label = "Deposit",
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
  label?: string;
}) {
  return (
    <Button
      asChild
      size={size}
      className={cn("gold-button hover:gold-button-hover shrink-0", className)}
    >
      <Link to="/app/wallet/deposit">{label}</Link>
    </Button>
  );
}

const LOCK_SIZES = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-6 w-6",
} as const;

/** Blurs charts/sparklines when balance is below the minimum deposit. */
export function GatedChart({
  children,
  className,
  lockSize = "md",
  showMessage,
  showDepositButton,
}: {
  children: ReactNode;
  className?: string;
  lockSize?: keyof typeof LOCK_SIZES;
  showMessage?: boolean;
  showDepositButton?: boolean;
}) {
  const { canViewPrices } = usePriceAccess();
  const messageVisible = showMessage ?? lockSize !== "sm";
  const depositVisible = showDepositButton ?? messageVisible;

  if (canViewPrices) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        depositVisible && lockSize === "lg" && "min-h-36 sm:min-h-40",
        depositVisible && lockSize === "md" && "min-h-20 sm:min-h-24",
        messageVisible && !depositVisible && "min-h-14 sm:min-h-16",
        className,
      )}
    >
      <div className="pointer-events-none h-full w-full select-none blur-md opacity-40">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 py-2 text-center">
        <Lock className={cn(LOCK_SIZES[lockSize], "shrink-0 text-[color:var(--gold)]")} />
        {messageVisible && (
          <p
            className={cn(
              "font-medium leading-snug text-foreground/90",
              lockSize === "lg" ? "max-w-xs text-sm" : "max-w-[10rem] text-[10px] sm:max-w-xs sm:text-xs",
            )}
          >
            {DEPOSIT_UNLOCK_MESSAGE}
          </p>
        )}
        {depositVisible && (
          <DepositButton
            size={lockSize === "lg" ? "default" : "sm"}
            label={lockSize === "lg" ? "Deposit funds" : "Deposit"}
            className={lockSize === "lg" ? "mt-1 h-9 px-4 text-xs" : "h-7 px-3 text-[10px] sm:text-xs"}
          />
        )}
      </div>
    </div>
  );
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
  const { canViewPrices } = usePriceAccess();
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
          {depositUnlockText()}
        </span>
      </div>
      <DepositButton size="sm" label="Deposit funds" />
    </div>
  );
}

export function PriceLockInline({ className }: { className?: string }) {
  const { canViewPrices } = usePriceAccess();
  if (canViewPrices) return null;

  return (
    <DepositButton
      size="sm"
      className={cn("h-7 gap-1.5 px-2.5 text-xs font-semibold", className)}
      label="Deposit"
    />
  );
}
