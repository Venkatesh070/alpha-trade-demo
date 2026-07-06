export type AssetCategory = "forex" | "crypto" | "metals" | "stocks" | "indices" | "energy";

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  changePct: number;
  spread: number;
  leverage: number;
  volume: string;
}

const FOREX: Asset[] = [
  {
    symbol: "EUR/USD",
    name: "Euro / US Dollar",
    category: "forex",
    price: 1.0842,
    changePct: 0.12,
    spread: 0.1,
    leverage: 2000,
    volume: "$2.4B",
  },
  {
    symbol: "GBP/USD",
    name: "British Pound / US Dollar",
    category: "forex",
    price: 1.2738,
    changePct: -0.08,
    spread: 0.2,
    leverage: 2000,
    volume: "$1.1B",
  },
  {
    symbol: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    category: "forex",
    price: 156.42,
    changePct: 0.31,
    spread: 0.3,
    leverage: 2000,
    volume: "$1.9B",
  },
  {
    symbol: "AUD/USD",
    name: "Australian Dollar / US Dollar",
    category: "forex",
    price: 0.6612,
    changePct: -0.21,
    spread: 0.3,
    leverage: 2000,
    volume: "$610M",
  },
  {
    symbol: "USD/CHF",
    name: "US Dollar / Swiss Franc",
    category: "forex",
    price: 0.9032,
    changePct: -0.14,
    spread: 0.3,
    leverage: 2000,
    volume: "$420M",
  },
  {
    symbol: "USD/CAD",
    name: "US Dollar / Canadian Dollar",
    category: "forex",
    price: 1.3712,
    changePct: 0.09,
    spread: 0.3,
    leverage: 2000,
    volume: "$510M",
  },
];

const CRYPTO: Asset[] = [
  {
    symbol: "BTC/USD",
    name: "Bitcoin",
    category: "crypto",
    price: 68420.5,
    changePct: 1.82,
    spread: 12,
    leverage: 400,
    volume: "$32.1B",
  },
  {
    symbol: "ETH/USD",
    name: "Ethereum",
    category: "crypto",
    price: 3542.18,
    changePct: 2.41,
    spread: 1.4,
    leverage: 200,
    volume: "$14.6B",
  },
  {
    symbol: "SOL/USD",
    name: "Solana",
    category: "crypto",
    price: 168.92,
    changePct: 4.12,
    spread: 0.4,
    leverage: 100,
    volume: "$3.2B",
  },
  {
    symbol: "XRP/USD",
    name: "XRP",
    category: "crypto",
    price: 0.5234,
    changePct: -1.04,
    spread: 0.001,
    leverage: 100,
    volume: "$1.8B",
  },
  {
    symbol: "ADA/USD",
    name: "Cardano",
    category: "crypto",
    price: 0.4612,
    changePct: 0.94,
    spread: 0.001,
    leverage: 100,
    volume: "$612M",
  },
  {
    symbol: "DOGE/USD",
    name: "Dogecoin",
    category: "crypto",
    price: 0.1421,
    changePct: -2.31,
    spread: 0.0008,
    leverage: 100,
    volume: "$1.1B",
  },
  {
    symbol: "BNB/USD",
    name: "BNB",
    category: "crypto",
    price: 612.4,
    changePct: 1.12,
    spread: 0.6,
    leverage: 100,
    volume: "$1.6B",
  },
  {
    symbol: "AVAX/USD",
    name: "Avalanche",
    category: "crypto",
    price: 36.42,
    changePct: 3.21,
    spread: 0.08,
    leverage: 100,
    volume: "$420M",
  },
];

const METALS: Asset[] = [
  {
    symbol: "XAU/USD",
    name: "Gold Spot",
    category: "metals",
    price: 2412.65,
    changePct: 0.42,
    spread: 0.18,
    leverage: 1000,
    volume: "$8.4B",
  },
  {
    symbol: "XAG/USD",
    name: "Silver Spot",
    category: "metals",
    price: 31.42,
    changePct: 1.12,
    spread: 0.02,
    leverage: 1000,
    volume: "$1.2B",
  },
  {
    symbol: "XPT/USD",
    name: "Platinum Spot",
    category: "metals",
    price: 1018.5,
    changePct: -0.32,
    spread: 2.5,
    leverage: 200,
    volume: "$210M",
  },
  {
    symbol: "XPD/USD",
    name: "Palladium Spot",
    category: "metals",
    price: 1042.2,
    changePct: 0.65,
    spread: 3.0,
    leverage: 200,
    volume: "$180M",
  },
];

const STOCKS: Asset[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "stocks",
    price: 214.32,
    changePct: 0.84,
    spread: 0.05,
    leverage: 20,
    volume: "$4.1B",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    category: "stocks",
    price: 248.51,
    changePct: -1.42,
    spread: 0.08,
    leverage: 20,
    volume: "$6.8B",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    category: "stocks",
    price: 432.18,
    changePct: 0.32,
    spread: 0.06,
    leverage: 20,
    volume: "$2.4B",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    category: "stocks",
    price: 1212.4,
    changePct: 2.54,
    spread: 0.12,
    leverage: 20,
    volume: "$8.6B",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    category: "stocks",
    price: 192.6,
    changePct: 0.42,
    spread: 0.05,
    leverage: 20,
    volume: "$3.2B",
  },
  {
    symbol: "META",
    name: "Meta Platforms",
    category: "stocks",
    price: 512.4,
    changePct: 1.21,
    spread: 0.08,
    leverage: 20,
    volume: "$2.1B",
  },
];

const INDICES: Asset[] = [
  {
    symbol: "US500",
    name: "S&P 500",
    category: "indices",
    price: 5432.5,
    changePct: 0.21,
    spread: 0.4,
    leverage: 200,
    volume: "$4.2B",
  },
  {
    symbol: "US30",
    name: "Dow Jones 30",
    category: "indices",
    price: 40124.3,
    changePct: 0.18,
    spread: 1.0,
    leverage: 200,
    volume: "$2.8B",
  },
  {
    symbol: "NAS100",
    name: "Nasdaq 100",
    category: "indices",
    price: 19542.1,
    changePct: 0.41,
    spread: 0.8,
    leverage: 200,
    volume: "$5.1B",
  },
  {
    symbol: "DAX40",
    name: "Germany 40",
    category: "indices",
    price: 18412.5,
    changePct: -0.14,
    spread: 0.8,
    leverage: 200,
    volume: "€1.4B",
  },
];

const ENERGY: Asset[] = [
  {
    symbol: "WTI",
    name: "Crude Oil WTI",
    category: "energy",
    price: 78.42,
    changePct: 1.21,
    spread: 0.04,
    leverage: 200,
    volume: "$3.4B",
  },
  {
    symbol: "BRENT",
    name: "Brent Crude",
    category: "energy",
    price: 82.51,
    changePct: 0.92,
    spread: 0.04,
    leverage: 200,
    volume: "$2.9B",
  },
  {
    symbol: "NATGAS",
    name: "Natural Gas",
    category: "energy",
    price: 2.812,
    changePct: -1.42,
    spread: 0.005,
    leverage: 100,
    volume: "$840M",
  },
];

export const ALL_ASSETS: Asset[] = [
  ...FOREX,
  ...CRYPTO,
  ...METALS,
  ...STOCKS,
  ...INDICES,
  ...ENERGY,
];

export const ASSETS_BY_CATEGORY: Record<AssetCategory, Asset[]> = {
  forex: FOREX,
  crypto: CRYPTO,
  metals: METALS,
  stocks: STOCKS,
  indices: INDICES,
  energy: ENERGY,
};

export function getAsset(symbol: string): Asset | undefined {
  return ALL_ASSETS.find((a) => a.symbol === symbol);
}

/** Deterministic seeded sparkline so SSR/CSR match. */
export function sparklineFor(symbol: string, points = 32): number[] {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed = (seed * 31 + symbol.charCodeAt(i)) >>> 0;
  const arr: number[] = [];
  let v = 50;
  for (let i = 0; i < points; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const r = (seed / 0xffffffff - 0.5) * 8;
    v = Math.max(8, Math.min(92, v + r));
    arr.push(v);
  }
  return arr;
}

/** Generates a candlestick series for the trading chart. */
export function generateCandles(symbol: string, count = 220, basePrice?: number) {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed = (seed * 31 + symbol.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  const out: { time: number; open: number; high: number; low: number; close: number }[] = [];
  let price = basePrice ?? 100;
  const now = Math.floor(Date.now() / 1000);
  const step = 60 * 15; // 15m
  for (let i = count; i > 0; i--) {
    const time = now - i * step;
    const drift = (rand() - 0.5) * price * 0.012;
    const open = price;
    const close = Math.max(0.0001, price + drift);
    const high = Math.max(open, close) + rand() * price * 0.006;
    const low = Math.min(open, close) - rand() * price * 0.006;
    out.push({ time, open, high, low, close });
    price = close;
  }
  return out;
}
