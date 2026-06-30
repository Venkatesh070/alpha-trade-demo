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
    <div className={cn("relative mx-auto space-y-6 p-4 pb-10 sm:p-6 lg:p-8", WIDTHS[width], className)}>
      <header className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold)]">{eyebrow}</p>
          )}
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-[1.75rem]">{title}</h1>
          {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}
