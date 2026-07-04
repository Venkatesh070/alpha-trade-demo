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
    <div
      className={cn(
        "glossy-soft group rounded-2xl p-5 transition-all duration-200 sm:p-6",
        "hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/10",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color:var(--gold)]/10 text-[color:var(--gold)] transition-colors group-hover:bg-[color:var(--gold)]/15">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div
        className="mt-4 font-display text-xl font-bold tracking-tight sm:text-2xl"
        style={{ color: accent ?? "var(--foreground)" }}
      >
        {value}
      </div>
      {sub && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{sub}</p>}
    </div>
  );
}
