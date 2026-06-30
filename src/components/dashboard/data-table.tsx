import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-surface/80 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </thead>
  );
}

export function DataTableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("border-t border-border/50 transition-colors hover:bg-accent/30", className)}>
      {children}
    </tr>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 font-medium sm:px-5", className)}>{children}</th>;
}

export function Td({ children, className, mono }: { children: ReactNode; className?: string; mono?: boolean }) {
  return (
    <td className={cn("px-4 py-3.5 sm:px-5", mono && "font-mono text-[13px]", className)}>
      {children}
    </td>
  );
}
