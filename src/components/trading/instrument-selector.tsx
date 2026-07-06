import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, X } from "lucide-react";
import { ALL_ASSETS, type Asset } from "@/data/markets";
import { AssetIcon, terminalSymbol } from "@/components/trading/asset-icon";
import { displayMarketSymbol } from "@/lib/market-display";
import { usePriceAccess } from "@/components/pricing/price-gate";
import { cn } from "@/lib/utils";

const QUICK_PICKS = ["XAU/USD", "BTC/USD", "USD/JPY", "EUR/USD", "GBP/USD", "ETH/USD"];

export function InstrumentSelector({
  symbol,
  onSelect,
  variant = "pill",
  asset,
  changeAbs = 0,
  changePct = 0,
  periodLabel = "1 Hour",
}: {
  symbol: string;
  onSelect: (symbol: string) => void;
  variant?: "pill" | "header" | "header-compact";
  asset?: Asset;
  changeAbs?: number;
  changePct?: number;
  periodLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { canViewPrices } = usePriceAccess();
  const up = changePct >= 0;
  const decimals = Math.abs(changeAbs) >= 1 ? 2 : Math.abs(changeAbs) >= 0.01 ? 3 : 5;
  const displayAsset = asset ?? ALL_ASSETS.find((a) => a.symbol === symbol);

  const instruments = useMemo(() => {
    const picks = QUICK_PICKS.map((s) => ALL_ASSETS.find((a) => a.symbol === s)).filter(
      Boolean,
    ) as Asset[];
    if (!q.trim()) return picks;
    return ALL_ASSETS.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q.toLowerCase()) ||
        a.name.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 12);
  }, [q]);

  const trigger =
    variant === "header-compact" && displayAsset ? (
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-accent/60"
      >
        <AssetIcon asset={displayAsset} size="sm" />
        <span className="text-[15px] font-bold leading-tight text-foreground">
          {displayMarketSymbol(displayAsset)}
        </span>
      </button>
    ) : variant === "header" && displayAsset ? (
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-accent/60"
      >
        <AssetIcon asset={displayAsset} />
        <div>
          <div className="text-[15px] font-bold leading-tight text-foreground">
            {displayMarketSymbol(displayAsset)}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12px]">
            {canViewPrices ? (
              <>
                <span
                  className={cn("font-mono tabular-nums", up ? "text-success" : "text-destructive")}
                >
                  {up ? "+" : ""}
                  {changeAbs.toFixed(decimals)}
                </span>
                {up ? (
                  <ArrowUp className="h-3 w-3 text-success" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-destructive" />
                )}
                <span
                  className={cn("font-mono tabular-nums", up ? "text-success" : "text-destructive")}
                >
                  {up ? "+" : ""}
                  {changePct.toFixed(2)}%
                </span>
              </>
            ) : (
              <span className="font-mono text-muted-foreground">—.— (—.—%)</span>
            )}
            <span className="text-muted-foreground">• {periodLabel}</span>
          </div>
        </div>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors",
          open
            ? "border-border bg-accent text-foreground"
            : "border-border bg-background text-foreground hover:bg-accent",
        )}
      >
        {terminalSymbol(symbol)}#
      </button>
    );

  return (
    <div className="relative">
      {trigger}

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close instrument list"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-1 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Select instrument</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-border px-3 py-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-gold/50"
              />
            </div>

            <ul className="max-h-64 overflow-y-auto py-1">
              {instruments.map((a) => {
                const selected = a.symbol === symbol;
                return (
                  <li key={a.symbol}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(a.symbol);
                        setOpen(false);
                        setQ("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        selected ? "bg-white/8" : "hover:bg-white/5",
                      )}
                    >
                      <AssetIcon asset={a} size="sm" />
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {displayMarketSymbol(a)}
                      </span>
                      {selected && <Check className="h-4 w-4 shrink-0 text-success" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
