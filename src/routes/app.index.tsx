import { createFileRoute, Link } from "@tanstack/react-router";
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Activity,
  Layers,
  Gauge,
  PiggyBank,
  LineChart,
} from "lucide-react";
import { Sparkline } from "@/components/site/sparkline";
import { AnimatedNumber } from "@/components/site/animated-number";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataPanel } from "@/components/dashboard/data-panel";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLivePrices } from "@/hooks/use-live-prices";
import { GatedPrice, GatedNumber, PriceLockBanner } from "@/components/pricing/price-gate";
import { ALL_ASSETS, sparklineFor } from "@/data/markets";
import { NEWS } from "@/data/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.45, ease: EASE },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const listStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const CARDS = [
  { label: "Balance", icon: Wallet, value: "₹10,00,000", amount: 1_000_000 },
  { label: "Equity", icon: PiggyBank, value: "₹10,24,520", amount: 1_024_520 },
  { label: "Profit (Today)", icon: TrendingUp, value: "+₹24,520", amount: 24_520, accent: "var(--success)", prefix: "+₹" },
  { label: "Margin", icon: Layers, value: "₹84,200", amount: 84_200 },
  { label: "Free Margin", icon: Activity, value: "₹9,40,320", amount: 940_320 },
  { label: "Leverage", icon: Gauge, value: "1:500" },
] as const;

const RECENT_TRADES = [
  { sym: "XAU/USD", side: "BUY" as const, qty: 0.1, px: 2412.55, pnl: 18.42 },
  { sym: "EUR/USD", side: "SELL" as const, qty: 0.5, px: 1.0842, pnl: -6.2 },
  { sym: "BTC/USD", side: "BUY" as const, qty: 0.01, px: 68420, pnl: 84.1 },
  { sym: "NIFTY50", side: "BUY" as const, qty: 1, px: 24412, pnl: 42.0 },
];

function formatInr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

const MarketMovers = memo(function MarketMovers() {
  const live = useLivePrices(4000);
  const movers = useMemo(
    () => [...ALL_ASSETS].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 6),
    [],
  );

  return (
    <motion.div variants={fadeUp}>
      <DataPanel title="Market movers" description="Largest % moves today">
        <PriceLockBanner className="mb-4" />
        <motion.ul
          className="space-y-1"
          variants={listStagger}
          initial="hidden"
          animate="show"
        >
          {movers.map((a) => {
            const p = live[a.symbol];
            return (
              <motion.li
                key={a.symbol}
                variants={fadeUp}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
              >
                <div
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-xl px-3 py-3.5 transition-colors",
                    "hover:bg-accent/50",
                  )}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-medium">{a.symbol}</div>
                  </div>
                  <GatedPrice
                    asset={a}
                    price={p?.price ?? a.price}
                    changePct={p?.changePct ?? a.changePct}
                  />
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </DataPanel>
    </motion.div>
  );
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const portfolioPoints = useMemo(() => sparklineFor("PORTFOLIO", 60), []);
  const displayName = loading ? "…" : (user?.name?.split(" ")[0] ?? "Trader");

  return (
    <PageShell
      eyebrow="Overview"
      title={`${displayName} · Trading Account`}
      description="Real-time portfolio snapshot, market movers, and recent activity."
      width="2xl"
      actions={
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: EASE }}
        >
          <Button asChild className="gold-button hover:gold-button-hover h-10 px-5">
            <Link to="/app/trading">
              <LineChart className="mr-2 h-4 w-4" /> Launch Terminal
            </Link>
          </Button>
        </motion.div>
      }
    >
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="space-y-8 sm:space-y-10"
      >
        <motion.div variants={fadeUp}>
          <PriceLockBanner />
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-6"
        >
          {CARDS.map((c) => (
            <motion.div key={c.label} variants={scaleIn} whileHover={{ y: -3, transition: { duration: 0.2 } }}>
              <StatCard
                label={c.label}
                icon={c.icon}
                accent={"accent" in c ? c.accent : undefined}
                value={
                  "amount" in c && c.amount !== undefined ? (
                    <AnimatedNumber
                      value={c.amount}
                      duration={1400}
                      format={(n) =>
                        "prefix" in c && c.prefix
                          ? `${c.prefix}${Math.round(n).toLocaleString("en-IN")}`
                          : formatInr(n)
                      }
                    />
                  ) : (
                    c.value
                  )
                }
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={stagger} className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <DataPanel
              title="Portfolio performance"
              description="Equity curve · last 30 days"
              padding={false}
            >
              <div className="border-b border-border/40 px-6 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <motion.div
                    className="font-display text-3xl font-bold tabular-nums sm:text-4xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.25, ease: EASE }}
                  >
                    <AnimatedNumber value={1_024_520} duration={1600} format={formatInr} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.55, ease: EASE }}
                  >
                    <StatusBadge variant="success" className="px-2.5 py-1">
                      +2.45% · 30d
                    </StatusBadge>
                  </motion.div>
                </div>
              </div>
              <motion.div
                className="h-56 px-4 py-5 sm:h-64 sm:px-6 sm:py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
              >
                <Sparkline points={portfolioPoints} up animated className="h-full w-full" />
              </motion.div>
            </DataPanel>
          </motion.div>

          <MarketMovers />
        </motion.div>

        <motion.div variants={stagger} className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          <motion.div variants={fadeUp}>
            <DataPanel title="Recent trades" description="Latest closed positions">
              <motion.ul
                className="space-y-1"
                variants={listStagger}
                initial="hidden"
                animate="show"
              >
                {RECENT_TRADES.map((t) => (
                  <motion.li
                    key={t.sym}
                    variants={fadeIn}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] items-center gap-x-4 gap-y-1 rounded-xl px-3 py-3.5 font-mono text-xs transition-colors hover:bg-accent/50 sm:gap-x-5 sm:py-4">
                      <span className="font-sans text-sm font-semibold">{t.sym}</span>
                      <StatusBadge variant={t.side === "BUY" ? "buy" : "sell"}>{t.side}</StatusBadge>
                      <span className="text-muted-foreground tabular-nums">{t.qty}</span>
                      <GatedNumber value={t.px} />
                      <GatedNumber
                        value={t.pnl.toFixed(2)}
                        prefix={t.pnl >= 0 ? "+" : ""}
                        className={cn(
                          "text-right font-medium",
                          t.pnl >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]",
                        )}
                      />
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </DataPanel>
          </motion.div>

          <motion.div variants={fadeUp}>
            <DataPanel title="Latest news" description="Market headlines">
              <motion.ul
                className="space-y-3 sm:space-y-4"
                variants={listStagger}
                initial="hidden"
                animate="show"
              >
                {NEWS.slice(0, 4).map((n) => (
                  <motion.li
                    key={n.id}
                    variants={scaleIn}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <div className="rounded-xl border border-border/50 bg-surface/40 p-4 transition-colors hover:border-[color:var(--gold)]/35 hover:bg-surface/70 sm:p-5">
                      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <StatusBadge variant="neutral">{n.category}</StatusBadge>
                        <span className="shrink-0">{n.time}</span>
                      </div>
                      <div className="mt-3 text-sm font-medium leading-snug sm:text-[0.9375rem]">
                        {n.title}
                      </div>
                      <div className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {n.excerpt}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </DataPanel>
          </motion.div>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}
