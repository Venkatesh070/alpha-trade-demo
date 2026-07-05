import { getAsset } from "@/data/markets";

export type TradingSearch = {
  symbol?: string;
};

export function parseTradingSearch(search: Record<string, unknown>): TradingSearch {
  const symbol = typeof search.symbol === "string" ? search.symbol : undefined;
  return { symbol: symbol && getAsset(symbol) ? symbol : undefined };
}
