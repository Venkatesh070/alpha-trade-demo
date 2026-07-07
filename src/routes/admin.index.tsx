import { createFileRoute } from "@tanstack/react-router";
import { Users, TrendingUp, Wallet, Activity } from "lucide-react";
import { AnimatedNumber } from "@/components/site/animated-number";
import { Sparkline } from "@/components/site/sparkline";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data, isLoading, isError } = useAdminDashboard(60);

  const stats = data?.stats ?? {
    totalUsers: 0,
    activeToday: 0,
    volume24h: 0,
    deposits24h: 0,
  };

  const chartPoints = data?.dailyActiveUsers.map((p) => p.count) ?? [];
  const chartUp =
    chartPoints.length < 2 || chartPoints[chartPoints.length - 1] >= chartPoints[0];

  const cards = [
    {
      label: "Total users",
      value: stats.totalUsers,
      icon: Users,
      accent: "var(--gold)",
    },
    {
      label: "Active today",
      value: stats.activeToday,
      icon: Activity,
      accent: "var(--success)",
    },
    {
      label: "Volume (24h)",
      value: stats.volume24h,
      icon: TrendingUp,
      fmt: (n: number) => `$${(n / 1e6).toFixed(1)}M`,
    },
    {
      label: "Deposits (24h)",
      value: stats.deposits24h,
      icon: Wallet,
      fmt: (n: number) => `₹${(n / 1e7).toFixed(2)}Cr`,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="font-display text-2xl font-bold">Admin overview</h1>

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load dashboard data. Check that you are signed in as admin.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="glossy-soft rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-[color:var(--gold)]" />
            </div>
            <div className="mt-2 font-display text-2xl font-bold">
              {isLoading ? (
                "…"
              ) : (
                <AnimatedNumber value={c.value} format={c.fmt} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="glossy rounded-2xl p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Daily active users · 60 days
        </div>
        <div className="mt-4 h-48">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading chart…
            </div>
          ) : chartPoints.length > 0 ? (
            <Sparkline points={chartPoints} up={chartUp} className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No activity data yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
