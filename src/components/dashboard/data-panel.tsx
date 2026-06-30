import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DataPanel({
  title,
  description,
  action,
  children,
  className,
  padding = true,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <section className={cn("glossy overflow-hidden rounded-2xl", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-4 sm:px-5">
          <div>
            {title && <h2 className="font-display text-base font-bold sm:text-lg">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn(!padding && "p-0", padding && !title && !action && "p-4 sm:p-5", padding && (title || action) && "p-0")}>
        {children}
      </div>
    </section>
  );
}
