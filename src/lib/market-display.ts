import type { Asset } from "@/data/markets";
import {
  XM_BORDER,
  XM_DOWN,
  XM_MARKET_BG,
  XM_ROW_ACTIVE,
  XM_ROW_HOVER,
  XM_TEXT,
  XM_TEXT_MUTED,
  XM_UP,
} from "@/lib/xm-trading-tokens";

/** XM-style ticker shown in the markets sidebar */
export function displayMarketSymbol(asset: Asset): string {
  const base = asset.symbol.replace("/", "");
  if (asset.category === "metals" && asset.symbol.startsWith("XAU")) return "GOLD.i#";
  if (asset.category === "metals" && asset.symbol.startsWith("XAG")) return "SILVER.i#";
  return `${base}#`;
}

/** Popular list order matching XM reference */
export const POPULAR_MARKET_SYMBOLS = [
  "XAU/USD",
  "BTC/USD",
  "USD/JPY",
  "EUR/USD",
  "GBP/USD",
  "NAS100",
  "ETH/USD",
  "US30",
  "USD/CHF",
  "AUD/USD",
  "DAX40",
  "USD/INR",
  "NIFTY50",
  "WTI",
] as const;

export const MARKET_SIDEBAR = {
  bg: XM_MARKET_BG,
  border: XM_BORDER,
  text: XM_TEXT,
  muted: XM_TEXT_MUTED,
  up: XM_UP,
  down: XM_DOWN,
  rowHover: XM_ROW_HOVER,
  rowActive: XM_ROW_ACTIVE,
} as const;
