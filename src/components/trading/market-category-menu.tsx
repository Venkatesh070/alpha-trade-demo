import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { toast } from "sonner";
import { MARKET_SIDEBAR } from "@/lib/market-display";
import { XM_ICON_BTN, XM_ICON_SIZE, XM_ICON_STROKE } from "@/lib/xm-trading-tokens";
import { cn } from "@/lib/utils";

export type MarketCategoryId =
  | "popular"
  | "forex"
  | "stocks"
  | "indices"
  | "thematic"
  | "commodities"
  | "crypto"
  | "top_gainers"
  | "top_losers"
  | "watchlist"
  | "new_watchlist"
  | "manage_watchlists";

const CATEGORIES: { id: MarketCategoryId; label: string; icon: string }[] = [
  { id: "popular", label: "Popular", icon: "🔥" },
  { id: "forex", label: "Forex", icon: "💵" },
  { id: "stocks", label: "Stocks CFDs", icon: "📊" },
  { id: "indices", label: "Equity Indices", icon: "🌍" },
  { id: "thematic", label: "Thematic Indices", icon: "🧩" },
  { id: "commodities", label: "Commodities", icon: "🛢️" },
  { id: "crypto", label: "Cryptocurrencies", icon: "₿" },
  { id: "top_gainers", label: "Top Gainers", icon: "📈" },
  { id: "top_losers", label: "Top Losers", icon: "📉" },
  { id: "watchlist", label: "My Watchlist", icon: "⭐" },
  { id: "new_watchlist", label: "New Watchlist", icon: "➕" },
  { id: "manage_watchlists", label: "Manage Watchlists", icon: "✏️" },
];

export function MarketCategoryMenu({
  value,
  onChange,
  showSearch,
  onToggleSearch,
  onClose,
}: {
  value: MarketCategoryId;
  onChange: (id: MarketCategoryId) => void;
  showSearch?: boolean;
  onToggleSearch?: () => void;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const active = CATEGORIES.find((c) => c.id === value) ?? CATEGORIES[0];

  const pick = (id: MarketCategoryId) => {
    if (id === "new_watchlist") {
      toast.info("Create a new watchlist from Settings");
      setOpen(false);
      return;
    }
    if (id === "manage_watchlists") {
      toast.info("Manage watchlists from Settings");
      setOpen(false);
      return;
    }
    onChange(id);
    setOpen(false);
  };

  return (
    <div
      className="relative shrink-0"
      style={{ background: MARKET_SIDEBAR.bg }}
    >
      <div
        className="flex items-center gap-2 px-3"
        style={{ height: 44 }}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-[13px] font-semibold"
          style={{ color: MARKET_SIDEBAR.text }}
        >
          <span className="text-sm leading-none">{active.icon}</span>
          <span>{active.label}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              open && "rotate-180",
            )}
            style={{ color: MARKET_SIDEBAR.muted }}
          />
        </button>

        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={onToggleSearch}
            className={cn(
              "grid place-items-center rounded transition-colors",
              showSearch ? "bg-accent" : "hover:bg-accent",
            )}
            style={{
              width: XM_ICON_BTN,
              height: XM_ICON_BTN,
              color: MARKET_SIDEBAR.muted,
            }}
            aria-label="Search"
          >
            <Search style={{ width: XM_ICON_SIZE, height: XM_ICON_SIZE, strokeWidth: XM_ICON_STROKE }} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="grid place-items-center rounded transition-colors hover:bg-accent"
            style={{
              width: XM_ICON_BTN,
              height: XM_ICON_BTN,
              color: MARKET_SIDEBAR.muted,
            }}
            aria-label="Close markets panel"
          >
            <X style={{ width: XM_ICON_SIZE, height: XM_ICON_SIZE, strokeWidth: XM_ICON_STROKE }} />
          </button>
        </div>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-2 right-2 top-full z-50 overflow-hidden rounded-lg border shadow-2xl"
            style={{ borderColor: MARKET_SIDEBAR.border, background: "var(--popover)" }}
          >
            <ul className="max-h-[min(420px,70vh)] overflow-y-auto py-1">
              {CATEGORIES.map((cat) => {
                const selected = cat.id === value;
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => pick(cat.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors",
                        selected
                          ? "bg-accent/80"
                          : "hover:bg-accent/50",
                      )}
                      style={{ color: MARKET_SIDEBAR.text }}
                    >
                      <span className="w-5 shrink-0 text-center text-base">{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
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
