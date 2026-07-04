import { createFileRoute, Link } from "@tanstack/react-router";
import { memo, useMemo } from "react";
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

const CARDS = [
  { label: "Balance", icon: Wallet, value: "₹10,00,000" },
  { label: "Equity", icon: PiggyBank, value: "₹10,24,520" },
  { label: "Profit (Today)", icon: TrendingUp, value: "+₹24,520", accent: "var(--success)" },
  { label: "Margin", icon: Layers, value: "₹84,200" },
  { label: "Free Margin", icon: Activity, value: "₹9,40,320" },
  { label: "Leverage", icon: Gauge, value: "1:500" },
] as const;

const RECENT_TRADES = [
  { sym: "XAU/USD", side: "BUY" as const, qty: 0.1, px: 2412.55, pnl: 18.42 },
  { sym: "EUR/USD", side: "SELL" as const, qty: 0.5, px: 1.0842, pnl: -6.2 },
  { sym: "BTC/USD", side: "BUY" as const, qty: 0.01, px: 68420, pnl: 84.1 },
  { sym: "NIFTY50", side: "BUY" as const, qty: 1, px: 24412, pnl: 42.0 },
];

const MarketMovers = memo(function MarketMovers() {
  const live = useLivePrices(4000);
  const movers = useMemo(
    () => [...ALL_ASSETS].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 6),
    [],
  );

  return (
    <DataPanel title="Market movers" description="Largest % moves today">
      <PriceLockBanner className="mb-4" />
      <ul className="space-y-1">
        {movers.map((a) => {
          const p = live[a.symbol];
          return (
            <li key={a.symbol}>
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
            </li>
          );
        })}
      </ul>
    </DataPanel>
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
        <Button asChild className="gold-button hover:gold-button-hover h-10 px-5">
          <Link to="/app/trading">
            <LineChart className="mr-2 h-4 w-4" /> Launch Terminal
          </Link>
        </Button>
      }
    >
      <PriceLockBanner />

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-6">
        {CARDS.map((c) => (
          <StatCard
            key={c.label}
            label={c.label}
            icon={c.icon}
            accent={"accent" in c ? c.accent : undefined}
            value={c.value}
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <DataPanel
          title="Portfolio performance"
          description="Equity curve · last 30 days"
          className="lg:col-span-2"
          padding={false}
        >
          <div className="border-b border-border/40 px-6 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="font-display text-3xl font-bold tabular-nums sm:text-4xl">
                ₹10,24,520
              </div>
              <StatusBadge variant="success" className="px-2.5 py-1">
                +2.45% · 30d
              </StatusBadge>
            </div>
          </div>
          <div className="h-56 px-4 py-5 sm:h-64 sm:px-6 sm:py-6">
            <Sparkline points={portfolioPoints} up className="h-full w-full" />
          </div>
        </DataPanel>

        <MarketMovers />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <DataPanel title="Recent trades" description="Latest closed positions">
          <ul className="space-y-1">
            {RECENT_TRADES.map((t) => (
              <li key={t.sym}>
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
              </li>
            ))}
          </ul>
        </DataPanel>

        <DataPanel title="Latest news" description="Market headlines">
          <ul className="space-y-3 sm:space-y-4">
            {NEWS.slice(0, 4).map((n) => (
              <li
                key={n.id}
                className="rounded-xl border border-border/50 bg-surface/40 p-4 transition-all duration-200 hover:-translate-y-px hover:border-[color:var(--gold)]/35 hover:bg-surface/70 sm:p-5"
              >
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
              </li>
            ))}
          </ul>
        </DataPanel>
      </div>
    </PageShell>
  );
}
