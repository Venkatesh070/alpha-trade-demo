import { useState, useMemo } from "react";
import { ASSETS_BY_CATEGORY, type AssetCategory } from "@/data/markets";
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices";
import { Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { id: AssetCategory | "favorites"; label: string }[] = [
  { id: "favorites", label: "★" },
  { id: "forex", label: "Forex" },
  { id: "crypto", label: "Crypto" },
  { id: "metals", label: "Metals" },
  { id: "indices", label: "Indices" },
  { id: "stocks", label: "Stocks" },
  { id: "energy", label: "Energy" },
];

export function MarketWatch({
  selected,
  onSelect,
  favorites,
  toggleFav,
}: {
  selected: string;
  onSelect: (s: string) => void;
  favorites: Set<string>;
  toggleFav: (s: string) => void;
}) {
  const [tab, setTab] = useState<AssetCategory | "favorites">("forex");
  const [q, setQ] = useState("");
  const live = useLivePrices(2000);

  const list = useMemo(() => {
    const base = tab === "favorites"
      ? Object.values(ASSETS_BY_CATEGORY).flat().filter((a) => favorites.has(a.symbol))
      : ASSETS_BY_CATEGORY[tab];
    return base.filter((a) => a.symbol.toLowerCase().includes(q.toLowerCase()) || a.name.toLowerCase().includes(q.toLowerCase()));
  }, [tab, q, favorites]);

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search symbol"
            className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-[color:var(--gold)]/40"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-1 px-3 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              tab === t.id ? "bg-[color:var(--gold)] text-[color:var(--primary-foreground)]" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ul className="divide-y divide-border/60">
          {list.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-muted-foreground">No symbols.</li>
          )}
          {list.map((a) => {
            const p = live[a.symbol];
            const up = (p?.changePct ?? a.changePct) >= 0;
            const isSel = selected === a.symbol;
            return (
              <li
                key={a.symbol}
                onClick={() => onSelect(a.symbol)}
                className={cn(
                  "group flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm transition-colors",
                  isSel ? "bg-accent" : "hover:bg-accent/60"
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFav(a.symbol); }}
                    className={cn("rounded p-1 text-muted-foreground", favorites.has(a.symbol) && "text-[color:var(--gold)]")}
                  >
                    <Star className={cn("h-3.5 w-3.5", favorites.has(a.symbol) && "fill-current")} />
                  </button>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.symbol}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{a.name}</div>
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-foreground">{formatPrice(a, p?.price ?? a.price)}</div>
                  <div className={up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]"}>
                    {(p?.changePct ?? a.changePct).toFixed(2)}%
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
