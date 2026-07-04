import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const WIDTHS = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
} as const;

export function PageShell({
  title,
  description,
  eyebrow,
  actions,
  children,
  width = "xl",
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto space-y-8 p-5 pb-12 sm:p-6 sm:space-y-10 lg:p-8 lg:pb-14",
        WIDTHS[width],
        className,
      )}
    >
      <header className="flex flex-col gap-5 border-b border-border/50 pb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pb-8">
        <div className="space-y-2">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold)]">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-[1.85rem] lg:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-3 sm:pb-0.5">{actions}</div>
        )}
      </header>
      <div className="space-y-8 sm:space-y-10">{children}</div>
    </div>
  );
}
