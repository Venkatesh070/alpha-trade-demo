import { useState, useMemo } from "react";
import { ALL_ASSETS, ASSETS_BY_CATEGORY, type Asset } from "@/data/markets";
import { useLivePrices } from "@/hooks/use-live-prices";
import { GatedPrice } from "@/components/pricing/price-gate";
import { getMarketStatus } from "@/lib/market-status";
import {
  displayMarketSymbol,
  MARKET_SIDEBAR,
  POPULAR_MARKET_SYMBOLS,
} from "@/lib/market-display";
import { AssetIcon } from "@/components/trading/asset-icon";
import {
  MarketCategoryMenu,
  type MarketCategoryId,
} from "@/components/trading/market-category-menu";
import { Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

function assetsForCategory(
  category: MarketCategoryId,
  favorites: Set<string>,
  live: ReturnType<typeof useLivePrices>,
): Asset[] {
  switch (category) {
    case "popular":
      return POPULAR_MARKET_SYMBOLS.map((s) => ALL_ASSETS.find((a) => a.symbol === s)).filter(
        Boolean,
      ) as Asset[];
    case "forex":
      return ASSETS_BY_CATEGORY.forex;
    case "stocks":
      return ASSETS_BY_CATEGORY.stocks;
    case "indices":
      return ASSETS_BY_CATEGORY.indices;
    case "thematic":
      return ASSETS_BY_CATEGORY.indices.slice(0, 4);
    case "commodities":
      return [...ASSETS_BY_CATEGORY.metals, ...ASSETS_BY_CATEGORY.energy];
    case "crypto":
      return ASSETS_BY_CATEGORY.crypto;
    case "top_gainers":
      return [...ALL_ASSETS]
        .sort(
          (a, b) =>
            (live[b.symbol]?.changePct ?? b.changePct) -
            (live[a.symbol]?.changePct ?? a.changePct),
        )
        .slice(0, 20);
    case "top_losers":
      return [...ALL_ASSETS]
        .sort(
          (a, b) =>
            (live[a.symbol]?.changePct ?? a.changePct) -
            (live[b.symbol]?.changePct ?? b.changePct),
        )
        .slice(0, 20);
    case "watchlist":
      return ALL_ASSETS.filter((a) => favorites.has(a.symbol));
    default:
      return POPULAR_MARKET_SYMBOLS.map((s) => ALL_ASSETS.find((a) => a.symbol === s)).filter(
        Boolean,
      ) as Asset[];
  }
}

function rowSubtitle(asset: Asset) {
  const status = getMarketStatus(asset);
  if (!status.open) return "Market Closed";
  return asset.name;
}

export function MarketWatch({
  selected,
  onSelect,
  favorites,
  toggleFav,
  variant = "default",
  onClose,
}: {
  selected: string;
  onSelect: (s: string) => void;
  favorites: Set<string>;
  toggleFav: (s: string) => void;
  variant?: "default" | "terminal";
  onClose?: () => void;
}) {
  const [category, setCategory] = useState<MarketCategoryId>("popular");
  const [q, setQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const live = useLivePrices(2000);

  const list = useMemo(() => {
    const base = assetsForCategory(category, favorites, live);
    return base.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q.toLowerCase()) ||
        a.name.toLowerCase().includes(q.toLowerCase()) ||
        displayMarketSymbol(a).toLowerCase().includes(q.toLowerCase()),
    );
  }, [category, q, favorites, live]);

  if (variant === "terminal") {
    return (
      <div className="flex h-full flex-col" style={{ background: MARKET_SIDEBAR.bg }}>
        <MarketCategoryMenu
          value={category}
          onChange={setCategory}
          showSearch={showSearch}
          onToggleSearch={() => setShowSearch((s) => !s)}
          onClose={onClose}
        />

        {showSearch && (
          <div
            className="shrink-0 border-b px-3 py-2"
            style={{ borderColor: MARKET_SIDEBAR.border }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search symbol"
              autoFocus
              className="h-9 w-full rounded border px-3 text-[13px] outline-none focus:ring-1 focus:ring-gold/40"
              style={{
                borderColor: MARKET_SIDEBAR.border,
                background: "var(--background)",
                color: MARKET_SIDEBAR.text,
              }}
            />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <ul>
            {list.length === 0 && (
              <li
                className="px-4 py-8 text-center text-xs"
                style={{ color: MARKET_SIDEBAR.muted }}
              >
                No instruments in this list.
              </li>
            )}
            {list.map((a) => {
              const p = live[a.symbol];
              const price = p?.price ?? a.price;
              const changePct = p?.changePct ?? a.changePct;
              const isSel = selected === a.symbol;
              const subtitle = rowSubtitle(a);

              return (
                <li
                  key={a.symbol}
                  onClick={() => onSelect(a.symbol)}
                  className="flex cursor-pointer items-center gap-2.5 border-b transition-colors"
                  style={{
                    height: 56,
                    paddingLeft: 12,
                    paddingRight: 12,
                    borderColor: MARKET_SIDEBAR.border,
                    background: isSel ? MARKET_SIDEBAR.rowActive : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSel) e.currentTarget.style.background = MARKET_SIDEBAR.rowHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSel) e.currentTarget.style.background = "";
                  }}
                >
                  <AssetIcon asset={a} size="sm" />
                  <div className="min-w-0 flex-1 pr-2">
                    <div
                      className="truncate text-[13px] font-semibold leading-tight"
                      style={{ color: MARKET_SIDEBAR.text }}
                    >
                      {displayMarketSymbol(a)}
                    </div>
                    <div
                      className="truncate text-[11px] leading-snug"
                      style={{ color: MARKET_SIDEBAR.muted }}
                    >
                      {subtitle}
                    </div>
                  </div>
                  <GatedPrice
                    asset={a}
                    price={price}
                    changePct={changePct}
                    align="right"
                    priceClassName="text-[13px] font-medium leading-tight"
                    changeClassName="text-[11px] leading-snug"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

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
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ul className="divide-y divide-border/60">
          {list.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-muted-foreground">No symbols.</li>
          )}
          {list.map((a) => {
            const p = live[a.symbol];
            const isSel = selected === a.symbol;
            return (
              <li
                key={a.symbol}
                onClick={() => onSelect(a.symbol)}
                className={cn(
                  "group flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm transition-colors",
                  isSel ? "bg-accent" : "hover:bg-accent/60",
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav(a.symbol);
                    }}
                    className={cn(
                      "rounded p-1 text-muted-foreground",
                      favorites.has(a.symbol) && "text-[color:var(--gold)]",
                    )}
                  >
                    <Star
                      className={cn("h-3.5 w-3.5", favorites.has(a.symbol) && "fill-current")}
                    />
                  </button>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.symbol}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{a.name}</div>
                  </div>
                </div>
                <GatedPrice
                  asset={a}
                  price={p?.price ?? a.price}
                  changePct={p?.changePct ?? a.changePct}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
