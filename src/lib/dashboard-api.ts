import { authFetch } from "@/lib/api-client";

export interface DashboardSummary {
  balance: number;
  equity: number;
  unrealizedPnl: number;
  margin: number;
  freeMargin: number;
  profitToday: number;
  change30dPct: number;
  leverage: number;
  leverageLabel: string;
  isFunded: boolean;
  minTradingBalance: number;
}

export interface DashboardEquityCurve {
  points: number[];
  equity: number;
  change30dPct: number;
}

export interface DashboardMarketMover {
  symbol: string;
  name: string;
  category: string;
  price: number;
  changePct: number;
}

export interface DashboardTrade {
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

export interface DashboardNewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  excerpt: string;
  publishedAt: string;
  time: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  equityCurve: DashboardEquityCurve;
  marketMovers: DashboardMarketMover[];
  recentTrades: DashboardTrade[];
  news: DashboardNewsItem[];
  openPositionsCount: number;
}

async function parseJson<T>(res: Response): Promise<T & { error?: string }> {
  return (await res.json()) as T & { error?: string };
}

async function get<T>(path: string): Promise<T> {
  const res = await authFetch(path);
  const data = await parseJson<T>(res);
  if (!res.ok) {
    throw new Error(data.error ?? "Dashboard request failed.");
  }
  return data;
}

export async function fetchDashboard(): Promise<DashboardData> {
  return get<DashboardData>("/api/dashboard");
}

export async function fetchDashboardSummary(): Promise<{ summary: DashboardSummary }> {
  return get("/api/dashboard/summary");
}

export async function fetchEquityCurve(
  points = 60,
): Promise<{ equityCurve: DashboardEquityCurve }> {
  return get(`/api/dashboard/equity-curve?points=${points}`);
}

export async function fetchMarketMovers(
  limit = 6,
): Promise<{ marketMovers: DashboardMarketMover[] }> {
  return get(`/api/dashboard/market-movers?limit=${limit}`);
}

export async function fetchRecentTrades(
  limit = 4,
): Promise<{ recentTrades: DashboardTrade[] }> {
  return get(`/api/dashboard/recent-trades?limit=${limit}`);
}

export async function fetchDashboardNews(
  limit = 4,
): Promise<{ news: DashboardNewsItem[] }> {
  return get(`/api/dashboard/news?limit=${limit}`);
}
