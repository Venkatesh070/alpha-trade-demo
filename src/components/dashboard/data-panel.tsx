import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DataPanel({
  title,
  description,
  action,
  children,
  className,
  padding = true,
  contentClassName,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: boolean;
  contentClassName?: string;
}) {
  const hasHeader = Boolean(title || action);

  return (
    <section
      className={cn(
        "glossy overflow-hidden rounded-2xl transition-shadow duration-200",
        "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/10",
        className,
      )}
    >
      {hasHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 space-y-1">
            {title && <h2 className="font-display text-base font-bold sm:text-lg">{title}</h2>}
            {description && (
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div
        className={cn(
          padding && "px-5 py-4 sm:px-6 sm:py-5",
          !padding && "p-0",
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
