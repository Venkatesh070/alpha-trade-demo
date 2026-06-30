import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Wallet, TrendingUp, Activity, Layers, Gauge, PiggyBank } from "lucide-react";
import { AnimatedNumber } from "@/components/site/animated-number";
import { Sparkline } from "@/components/site/sparkline";
import { useAuth } from "@/hooks/use-auth";
import { useLivePrices, formatPrice } from "@/hooks/use-live-prices";
import { ALL_ASSETS, sparklineFor } from "@/data/markets";
import { NEWS } from "@/data/content";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const live = useLivePrices(2500);
  const portfolioPoints = sparklineFor("PORTFOLIO", 60);
  const movers = [...ALL_ASSETS].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 6);

  const cards = [
    { label: "Balance",     icon: Wallet,     value: 1000000, fmt: (n: number) => `₹${n.toLocaleString()}` },
    { label: "Equity",      icon: PiggyBank,  value: 1024520, fmt: (n: number) => `₹${n.toLocaleString()}` },
    { label: "Profit (Today)", icon: TrendingUp, value: 24520,    fmt: (n: number) => `+₹${n.toLocaleString()}`, accent: "var(--success)" },
    { label: "Margin",      icon: Layers,     value: 84200,    fmt: (n: number) => `₹${n.toLocaleString()}` },
    { label: "Free Margin", icon: Activity,   value: 940320,   fmt: (n: number) => `₹${n.toLocaleString()}` },
    { label: "Leverage",    icon: Gauge,      value: 500,      fmt: (n: number) => `1:${n}` },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Welcome back</div>
          <h1 className="font-display text-2xl font-bold">{user?.name?.split(" ")[0] ?? "Trader"} · Demo Account</h1>
        </div>
        <Link to="/trading" className="gold-button hover:gold-button-hover rounded-md px-4 py-2 text-sm font-semibold">Launch Terminal</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="glossy-soft rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-[color:var(--gold)]" />
            </div>
            <div className="mt-2 font-display text-xl font-bold" style={{ color: c.accent ?? "var(--foreground)" }}>
              <AnimatedNumber value={c.value} format={c.fmt} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glossy rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Portfolio</div>
              <div className="font-display text-2xl font-bold">₹10,24,520</div>
            </div>
            <div className="rounded-md bg-[color:var(--success)]/20 px-2 py-1 text-xs font-mono text-[color:var(--success)]">+2.45% · 30d</div>
          </div>
          <div className="mt-4 h-48"><Sparkline points={portfolioPoints} up className="h-full w-full" /></div>
        </div>

        <div className="glossy-soft rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Market movers</div>
          <ul className="mt-3 divide-y divide-border/60">
            {movers.map((a) => {
              const p = live[a.symbol]?.changePct ?? a.changePct;
              const up = p >= 0;
              return (
                <li key={a.symbol} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <div className="font-medium">{a.symbol}</div>
                    <div className="text-xs text-muted-foreground">{formatPrice(a, live[a.symbol]?.price ?? a.price)}</div>
                  </div>
                  <div className={"flex items-center gap-1 font-mono text-xs " + (up ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>
                    {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {p.toFixed(2)}%
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glossy-soft rounded-2xl p-5">
          <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Recent trades</div>
          <ul className="divide-y divide-border/60 text-sm">
            {[
              { sym: "XAU/USD", side: "BUY", qty: 0.1, px: 2412.55, pnl: 18.42 },
              { sym: "EUR/USD", side: "SELL", qty: 0.5, px: 1.0842, pnl: -6.20 },
              { sym: "BTC/USD", side: "BUY", qty: 0.01, px: 68420, pnl: 84.10 },
              { sym: "NIFTY50", side: "BUY", qty: 1, px: 24412, pnl: 42.00 },
            ].map((t, i) => (
              <li key={i} className="flex items-center justify-between py-2 font-mono text-xs">
                <span className="font-semibold">{t.sym}</span>
                <span className={t.side === "BUY" ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]"}>{t.side}</span>
                <span>{t.qty}</span>
                <span>{t.px}</span>
                <span className={t.pnl >= 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]"}>{t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glossy-soft rounded-2xl p-5">
          <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Latest news</div>
          <ul className="space-y-3">
            {NEWS.slice(0, 4).map((n) => (
              <li key={n.id} className="rounded-lg border border-border/60 p-3 hover:border-[color:var(--gold)]/40">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="rounded bg-accent px-1.5 py-0.5">{n.category}</span>
                  <span>{n.time}</span>
                </div>
                <div className="mt-1 text-sm font-medium">{n.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{n.excerpt}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
