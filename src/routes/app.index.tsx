import { createFileRoute, Link } from "@tanstack/react-router";
import { memo, useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Wallet, TrendingUp, Activity, Layers, Gauge, PiggyBank, LineChart } from "lucide-react";
import { Sparkline } from "@/components/site/sparkline";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataPanel } from "@/components/dashboard/data-panel";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices";
import { ALL_ASSETS, sparklineFor } from "@/data/markets";
import { NEWS } from "@/data/content";

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
  { sym: "EUR/USD", side: "SELL" as const, qty: 0.5, px: 1.0842, pnl: -6.20 },
  { sym: "BTC/USD", side: "BUY" as const, qty: 0.01, px: 68420, pnl: 84.10 },
  { sym: "NIFTY50", side: "BUY" as const, qty: 1, px: 24412, pnl: 42.00 },
];

const MarketMovers = memo(function MarketMovers() {
  const live = useLivePrices(4000);
  const movers = useMemo(
    () => [...ALL_ASSETS].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 6),
    [],
  );

  return (
    <DataPanel title="Market movers" description="Largest % moves today">
      <ul className="divide-y divide-border/50">
        {movers.map((a) => {
          const p = live[a.symbol]?.changePct ?? a.changePct;
          const up = p >= 0;
          return (
            <li key={a.symbol} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <div className="font-medium">{a.symbol}</div>
                <div className="text-xs tabular-nums text-muted-foreground">{formatPrice(a, live[a.symbol]?.price ?? a.price)}</div>
              </div>
              <div className={"flex items-center gap-1 font-mono text-xs font-medium tabular-nums " + (up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>
                {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {p.toFixed(2)}%
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
      title={`${displayName} · Demo Account`}
      description="Real-time portfolio snapshot, market movers, and recent activity."
      width="2xl"
      actions={
        <Button asChild className="gold-button hover:gold-button-hover">
          <Link to="/app/trading"><LineChart className="mr-2 h-4 w-4" /> Launch Terminal</Link>
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <DataPanel title="Portfolio performance" description="Equity curve · last 30 days" className="lg:col-span-2" padding={false}>
          <div className="border-b border-border/40 px-5 py-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="font-display text-3xl font-bold tabular-nums">₹10,24,520</div>
              <StatusBadge variant="success">+2.45% · 30d</StatusBadge>
            </div>
          </div>
          <div className="h-52 px-2 py-4 sm:h-56">
            <Sparkline points={portfolioPoints} up className="h-full w-full" />
          </div>
        </DataPanel>

        <MarketMovers />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DataPanel title="Recent trades">
          <ul className="divide-y divide-border/50 font-mono text-xs">
            {RECENT_TRADES.map((t) => (
              <li key={t.sym} className="flex items-center justify-between gap-2 py-3 first:pt-0">
                <span className="font-sans font-semibold">{t.sym}</span>
                <StatusBadge variant={t.side === "BUY" ? "buy" : "sell"}>{t.side}</StatusBadge>
                <span className="text-muted-foreground">{t.qty}</span>
                <span className="tabular-nums">{t.px}</span>
                <span className={"tabular-nums " + (t.pnl >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>
                  {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </DataPanel>

        <DataPanel title="Latest news">
          <ul className="space-y-3">
            {NEWS.slice(0, 4).map((n) => (
              <li key={n.id} className="rounded-xl border border-border/50 bg-surface/40 p-3.5 transition-colors hover:border-[color:var(--gold)]/35 hover:bg-surface/70">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <StatusBadge variant="neutral">{n.category}</StatusBadge>
                  <span>{n.time}</span>
                </div>
                <div className="mt-2 text-sm font-medium leading-snug">{n.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.excerpt}</div>
              </li>
            ))}
          </ul>
        </DataPanel>
      </div>
    </PageShell>
  );
}
