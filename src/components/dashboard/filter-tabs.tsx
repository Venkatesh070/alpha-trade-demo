import { cn } from "@/lib/utils";

export function FilterTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-surface/60 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all",
            value === t.id
              ? "bg-[color:var(--gold)] text-[color:var(--primary-foreground)] shadow-sm"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
