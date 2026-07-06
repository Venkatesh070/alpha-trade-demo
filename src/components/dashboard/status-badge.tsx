import { cn } from "@/lib/utils";

type Variant = "success" | "warning" | "danger" | "neutral" | "gold" | "buy" | "sell";

const STYLES: Record<Variant, string> = {
  success:
    "bg-[color:var(--success)]/12 text-[color:var(--success)] ring-1 ring-[color:var(--success)]/20",
  warning:
    "bg-[color:var(--warning)]/12 text-[color:var(--warning)] ring-1 ring-[color:var(--warning)]/20",
  danger:
    "bg-[color:var(--destructive)]/12 text-[color:var(--destructive)] ring-1 ring-[color:var(--destructive)]/20",
  neutral: "bg-accent text-muted-foreground ring-1 ring-border/60",
  gold: "bg-[color:var(--gold)]/12 text-[color:var(--gold)] ring-1 ring-[color:var(--gold)]/25",
  buy: "bg-[color:var(--buy)]/12 text-[color:var(--buy)] ring-1 ring-[color:var(--buy)]/20",
  sell: "bg-[color:var(--destructive)]/12 text-[color:var(--destructive)] ring-1 ring-[color:var(--destructive)]/20",
};

export function StatusBadge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        STYLES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
