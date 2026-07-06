export const TRADING_STORAGE_KEY = "exness-trading";

export interface OpenPosition {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  type: string;
  price: number;
  pnl: number;
  openedAt: number;
  sl?: number;
  tp?: number;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  openPrice: number;
  closePrice: number;
  pnl: number;
  openedAt: number;
  closedAt: number;
}

export interface TradingState {
  open: OpenPosition[];
  closed: ClosedTrade[];
}

type TradingDb = Record<string, TradingState>;

export function emptyTrading(): TradingState {
  return { open: [], closed: [] };
}

export function loadTradingDb(): TradingDb {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(TRADING_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveTradingDb(db: TradingDb) {
  window.localStorage.setItem(TRADING_STORAGE_KEY, JSON.stringify(db));
}

export function getTrading(email: string): TradingState {
  return loadTradingDb()[email] ?? emptyTrading();
}

export function updateTrading(email: string, updater: (prev: TradingState) => TradingState) {
  const db = loadTradingDb();
  const next = updater(db[email] ?? emptyTrading());
  db[email] = next;
  saveTradingDb(db);
  return next;
}
