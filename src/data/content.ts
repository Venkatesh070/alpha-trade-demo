export interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  time: string;
  excerpt: string;
}

export const NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "Gold steadies near record highs as Fed rate path unclear",
    source: "Market Wire",
    category: "Metals",
    time: "12m ago",
    excerpt:
      "Spot gold hovered above $2,400/oz as traders weighed mixed signals from Federal Reserve officials.",
  },
  {
    id: "n2",
    title: "Bitcoin reclaims $68K on spot ETF inflows",
    source: "CryptoDesk",
    category: "Crypto",
    time: "34m ago",
    excerpt: "Institutional inflows accelerated overnight, pushing BTC back above key resistance.",
  },
  {
    id: "n3",
    title: "Rupee firms vs dollar on RBI intervention",
    source: "DalalStreet",
    category: "Forex",
    time: "1h ago",
    excerpt: "USD/INR slipped from session highs as state-run banks were spotted selling dollars.",
  },
  {
    id: "n4",
    title: "Nifty 50 prints fresh all-time high led by IT pack",
    source: "DalalStreet",
    category: "Indices",
    time: "2h ago",
    excerpt: "Index heavyweights TCS and Infosys lifted the benchmark to a new record.",
  },
  {
    id: "n5",
    title: "Brent crude eases as OPEC+ signals output rise",
    source: "EnergyToday",
    category: "Energy",
    time: "3h ago",
    excerpt:
      "Oil prices retreated after the cartel hinted at gradual production increases from October.",
  },
  {
    id: "n6",
    title: "Tesla deliveries beat estimates, shares pop after-hours",
    source: "WallStreet",
    category: "Stocks",
    time: "4h ago",
    excerpt: "Q2 deliveries came in ahead of consensus, easing demand concerns.",
  },
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  rating: number;
  quote: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Arjun Mehta",
    role: "Day Trader",
    city: "Mumbai",
    rating: 5,
    quote:
      "Tight spreads on USD/INR and instant withdrawals. The terminal is faster than anything else I've used in India.",
  },
  {
    id: "t2",
    name: "Priya Singh",
    role: "Swing Trader",
    city: "Bengaluru",
    rating: 5,
    quote:
      "Copy trading turned my weekends into a real income stream. The analytics on each strategist are world-class.",
  },
  {
    id: "t3",
    name: "Rahul Khanna",
    role: "Crypto Investor",
    city: "Delhi",
    rating: 4,
    quote: "Charting with 30+ indicators and one-click leverage controls. Everything just works.",
  },
  {
    id: "t4",
    name: "Sneha Iyer",
    role: "Forex Pro",
    city: "Chennai",
    rating: 5,
    quote:
      "The 2000:1 leverage and ultra-low latency execution put me on equal footing with institutional desks.",
  },
  {
    id: "t5",
    name: "Vikram Joshi",
    role: "Educator",
    city: "Pune",
    rating: 5,
    quote:
      "I onboard my students here. The education hub and account signup flow are the cleanest in the industry.",
  },
  {
    id: "t6",
    name: "Ananya Rao",
    role: "Quant Analyst",
    city: "Hyderabad",
    rating: 4,
    quote:
      "Historical data, deep order book, and a stable WebSocket feed. A genuinely premium broker experience.",
  },
];

export interface FaqItem {
  q: string;
  a: string;
  category: string;
}

export const FAQS: FaqItem[] = [
  {
    category: "Account",
    q: "How do I open an account?",
    a: "Click 'Open Account' on the landing page. You'll receive a virtual ₹10,00,000 balance instantly — no KYC required.",
  },
  {
    category: "Account",
    q: "Is verification required for live trading?",
    a: "Yes. We follow SEBI guidelines and need a valid PAN, Aadhaar, and a recent bank statement before live funds are enabled.",
  },
  {
    category: "Trading",
    q: "What instruments can I trade?",
    a: "Forex (60+ pairs), crypto, gold, silver, oil, global indices (S&P 500, Nifty, DAX) and 1,000+ stocks.",
  },
  {
    category: "Trading",
    q: "What is the minimum lot size?",
    a: "0.01 lots for forex, 0.001 BTC for crypto, and 1 share for equity CFDs.",
  },
  {
    category: "Trading",
    q: "How fast is order execution?",
    a: "Average execution latency is under 15 ms with no requotes on standard accounts.",
  },
  {
    category: "Funding",
    q: "What deposit methods are supported?",
    a: "UPI, IMPS, NEFT, RTGS, debit/credit cards, and crypto deposits in USDT/BTC.",
  },
  {
    category: "Funding",
    q: "Are there deposit or withdrawal fees?",
    a: "No. Exness India absorbs all payment processing costs on deposits and withdrawals.",
  },
  {
    category: "Funding",
    q: "How fast are withdrawals?",
    a: "UPI withdrawals are instant. Bank transfers settle within 1 business day.",
  },
  {
    category: "Platform",
    q: "Is there a mobile app?",
    a: "Yes — full-feature iOS and Android apps with biometric login and push price alerts.",
  },
  {
    category: "Platform",
    q: "Can I use automated strategies?",
    a: "Yes. The terminal supports EA-style automation and a REST/WebSocket API for custom bots.",
  },
  {
    category: "Security",
    q: "How are my funds protected?",
    a: "All client funds sit in segregated tier-1 bank accounts and are covered by negative balance protection.",
  },
  {
    category: "Security",
    q: "Do you offer two-factor authentication?",
    a: "Yes, both TOTP (Google/Authy) and SMS-based 2FA. We strongly recommend TOTP.",
  },
];

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readMin: number;
}

export const BLOGS: BlogPost[] = [
  {
    slug: "rbi-rate-decision",
    title: "Decoding the RBI rate decision: what it means for INR pairs",
    excerpt: "Three scenarios for USD/INR, EUR/INR and GBP/INR after the upcoming MPC meeting.",
    author: "Arjun Mehta",
    date: "Jun 24, 2026",
    category: "Macro",
    readMin: 6,
  },
  {
    slug: "btc-halving-after",
    title: "Beyond the BTC halving: positioning into Q3",
    excerpt: "On-chain flows, ETF demand and what it signals for the next leg.",
    author: "Priya Singh",
    date: "Jun 22, 2026",
    category: "Crypto",
    readMin: 8,
  },
  {
    slug: "gold-2500-thesis",
    title: "The $2,500 gold thesis",
    excerpt: "Why central bank buying could push spot through $2,500 by year-end.",
    author: "Rahul Khanna",
    date: "Jun 18, 2026",
    category: "Metals",
    readMin: 5,
  },
  {
    slug: "intraday-nifty-setups",
    title: "5 intraday setups for Nifty 50 traders",
    excerpt: "ORB, VWAP fades, gap-and-go, supply-zone reversal and the 15-min squeeze.",
    author: "Sneha Iyer",
    date: "Jun 14, 2026",
    category: "Education",
    readMin: 9,
  },
  {
    slug: "risk-management-101",
    title: "Risk management 101: position sizing with leverage",
    excerpt: "How to compute lot sizes that respect your max-loss budget.",
    author: "Vikram Joshi",
    date: "Jun 10, 2026",
    category: "Education",
    readMin: 7,
  },
  {
    slug: "ai-in-trading",
    title: "Where AI actually helps retail traders",
    excerpt: "Filters, journaling, anomaly detection — not magic predictions.",
    author: "Ananya Rao",
    date: "Jun 06, 2026",
    category: "Tech",
    readMin: 6,
  },
];

export interface TopTrader {
  id: string;
  name: string;
  handle: string;
  country: string;
  roiYear: number;
  winRate: number;
  followers: number;
  risk: "Low" | "Medium" | "High";
  copiers: number;
  aum: string;
  strategy: string;
}

export const TRADERS: TopTrader[] = [
  {
    id: "tr1",
    name: "Aditya Verma",
    handle: "@aditya_fx",
    country: "IN",
    roiYear: 184.2,
    winRate: 72,
    followers: 12842,
    risk: "Medium",
    copiers: 2104,
    aum: "$1.8M",
    strategy: "Forex swing — DXY divergence",
  },
  {
    id: "tr2",
    name: "Maya Lin",
    handle: "@maya_quant",
    country: "SG",
    roiYear: 96.5,
    winRate: 81,
    followers: 9120,
    risk: "Low",
    copiers: 3210,
    aum: "$3.2M",
    strategy: "Market-neutral pairs",
  },
  {
    id: "tr3",
    name: "Diego Souza",
    handle: "@diego_crypto",
    country: "BR",
    roiYear: 312.8,
    winRate: 58,
    followers: 18421,
    risk: "High",
    copiers: 980,
    aum: "$640K",
    strategy: "Crypto momentum",
  },
  {
    id: "tr4",
    name: "Ishaan Kapoor",
    handle: "@ishaan_gold",
    country: "IN",
    roiYear: 64.4,
    winRate: 76,
    followers: 7204,
    risk: "Low",
    copiers: 1820,
    aum: "$1.1M",
    strategy: "Gold + DXY mean reversion",
  },
  {
    id: "tr5",
    name: "Sara Yilmaz",
    handle: "@sara_indices",
    country: "TR",
    roiYear: 142.1,
    winRate: 68,
    followers: 8412,
    risk: "Medium",
    copiers: 1612,
    aum: "$1.4M",
    strategy: "Index breakout intraday",
  },
  {
    id: "tr6",
    name: "Kenta Mori",
    handle: "@kenta_jpy",
    country: "JP",
    roiYear: 88.9,
    winRate: 74,
    followers: 6820,
    risk: "Medium",
    copiers: 1402,
    aum: "$960K",
    strategy: "USD/JPY carry + hedge",
  },
];

export interface Competition {
  id: string;
  name: string;
  prize: string;
  participants: number;
  endsIn: string;
  status: "live" | "upcoming" | "ended";
  description: string;
}

export const COMPETITIONS: Competition[] = [
  {
    id: "c1",
    name: "Monsoon Trader Cup 2026",
    prize: "₹10,00,000",
    participants: 4821,
    endsIn: "12d 04h",
    status: "live",
    description: "Highest ROI on a ₹1L account wins. Live leaderboard updates every minute.",
  },
  {
    id: "c2",
    name: "Crypto Champions League",
    prize: "$5,000 USDT",
    participants: 2104,
    endsIn: "5d 11h",
    status: "live",
    description: "Crypto-only instruments. Top 50 split the prize pool.",
  },
  {
    id: "c3",
    name: "Gold Rush Weekend",
    prize: "10 oz Gold",
    participants: 980,
    endsIn: "Starts in 3d",
    status: "upcoming",
    description: "48-hour XAU/USD challenge. Lowest drawdown takes the bar.",
  },
  {
    id: "c4",
    name: "India Independence Cup",
    prize: "₹25,00,000",
    participants: 0,
    endsIn: "Starts Aug 15",
    status: "upcoming",
    description: "India's biggest demo-trading event. Open to verified residents.",
  },
];

export interface LeaderboardEntry {
  rank: number;
  name: string;
  pnl: number;
  roi: number;
  trades: number;
  country: string;
}
export const LEADERBOARD: LeaderboardEntry[] = Array.from({ length: 50 }, (_, i) => {
  const seed = (i + 1) * 9301;
  const r = ((seed * 49297) % 233280) / 233280;
  return {
    rank: i + 1,
    name:
      [
        "Aditya V",
        "Maya L",
        "Diego S",
        "Ishaan K",
        "Sara Y",
        "Kenta M",
        "Rohit B",
        "Liya C",
        "Mihir D",
        "Nisha P",
      ][i % 10] +
      " " +
      (i + 1),
    pnl: Math.round((500000 - i * 7800 + r * 50000) * 100) / 100,
    roi: Math.round((180 - i * 2.6 + r * 8) * 10) / 10,
    trades: 220 - i * 3 + Math.floor(r * 30),
    country: ["IN", "SG", "BR", "TR", "JP", "AE", "ID", "MY", "PH", "VN"][i % 10],
  };
});

export interface AppNotification {
  id: string;
  type: "trade" | "deposit" | "verification" | "promo" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "no1",
    type: "trade",
    title: "Order filled",
    body: "BUY 0.10 XAU/USD @ 2412.55 executed.",
    time: "2m ago",
    read: false,
  },
  {
    id: "no2",
    type: "deposit",
    title: "Deposit received",
    body: "₹25,000 credited via UPI.",
    time: "1h ago",
    read: false,
  },
  {
    id: "no3",
    type: "verification",
    title: "KYC approved",
    body: "Your account is fully verified.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "no4",
    type: "promo",
    title: "Monsoon Trader Cup is live",
    body: "Compete for a ₹10L prize pool.",
    time: "2d ago",
    read: true,
  },
  {
    id: "no5",
    type: "system",
    title: "Platform maintenance complete",
    body: "Latency improvements rolled out.",
    time: "3d ago",
    read: true,
  },
];

export interface PricingTier {
  name: string;
  tagline: string;
  spread: string;
  commission: string;
  leverage: string;
  minDeposit: string;
  featured?: boolean;
  features: string[];
}

export const PRICING: PricingTier[] = [
  {
    name: "Standard",
    tagline: "Start with zero commission",
    spread: "from 0.3 pips",
    commission: "₹0",
    leverage: "1:2000",
    minDeposit: "₹0",
    features: [
      "All 200+ instruments",
      "Instant deposits",
      "Account included",
      "24×7 support",
      "Copy trading",
    ],
  },
  {
    name: "Pro",
    tagline: "Built for active traders",
    spread: "from 0.1 pips",
    commission: "$3.5 / lot",
    leverage: "1:2000",
    minDeposit: "₹50,000",
    featured: true,
    features: [
      "Raw spreads",
      "Priority execution",
      "Advanced charting",
      "Strategy backtester",
      "Dedicated account manager",
      "Lower swap rates",
    ],
  },
  {
    name: "Institutional",
    tagline: "For funds and prop desks",
    spread: "from 0.0 pips",
    commission: "Custom",
    leverage: "Custom",
    minDeposit: "₹50,00,000",
    features: [
      "Bespoke liquidity",
      "FIX API",
      "Sub-accounts & PAMM",
      "Co-located VPS",
      "White-glove onboarding",
      "Custom risk controls",
    ],
  },
];

export interface Feature {
  icon: string;
  title: string;
  desc: string;
}
export const FEATURES: Feature[] = [
  {
    icon: "Zap",
    title: "Ultra-Fast Execution",
    desc: "Sub-15ms average fill time across 12 global liquidity hubs.",
  },
  {
    icon: "TrendingDown",
    title: "Razor-Thin Spreads",
    desc: "From 0.0 pips on Pro, with no markup or hidden fees.",
  },
  {
    icon: "Wallet",
    title: "Instant UPI Deposits",
    desc: "Funds in your trading wallet within seconds — 24×7.",
  },
  { icon: "Users", title: "Copy Trading", desc: "Mirror top-ranked strategists with one tap." },
  {
    icon: "GraduationCap",
    title: "Trading Academy",
    desc: "200+ lessons, daily webinars, and live market breakdowns.",
  },
  {
    icon: "BarChart3",
    title: "Pro Analysis",
    desc: "AI-curated news, signals, and macro calendar.",
  },
  {
    icon: "ShieldCheck",
    title: "Bank-Grade Security",
    desc: "Segregated funds, 2FA, and ISO 27001 infrastructure.",
  },
  {
    icon: "Globe2",
    title: "200+ Markets",
    desc: "Forex, crypto, metals, oil, indices and global equities.",
  },
];
