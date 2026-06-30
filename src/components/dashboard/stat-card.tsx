import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  accent?: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("glossy-soft rounded-2xl p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--gold)]/10 text-[color:var(--gold)]">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-xl font-bold tracking-tight sm:text-2xl" style={{ color: accent ?? "var(--foreground)" }}>
        {value}
      </div>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
