import { createFileRoute } from "@tanstack/react-router";
import { Users, TrendingUp, Wallet, Activity } from "lucide-react";
import { AnimatedNumber } from "@/components/site/animated-number";
import { Sparkline } from "@/components/site/sparkline";
import { sparklineFor } from "@/data/markets";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const cards = [
    { label: "Total users", value: 48210, icon: Users, accent: "var(--gold)" },
    { label: "Active today", value: 12420, icon: Activity, accent: "var(--success)" },
    { label: "Volume (24h)", value: 482000000, icon: TrendingUp, fmt: (n: number) => `$${(n/1e6).toFixed(1)}M` },
    { label: "Deposits (24h)", value: 28412000, icon: Wallet, fmt: (n: number) => `₹${(n/1e7).toFixed(2)}Cr` },
  ];
  return (
    <div className="space-y-6 p-6">
      <h1 className="font-display text-2xl font-bold">Admin overview</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="glossy-soft rounded-2xl p-4">
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{c.label}</span><c.icon className="h-4 w-4 text-[color:var(--gold)]" /></div>
            <div className="mt-2 font-display text-2xl font-bold"><AnimatedNumber value={c.value} format={c.fmt} /></div>
          </div>
        ))}
      </div>
      <div className="glossy rounded-2xl p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Daily active users · 60 days</div>
        <div className="mt-4 h-48"><Sparkline points={sparklineFor("ADMIN_DAU", 60)} up className="h-full w-full" /></div>
      </div>
    </div>
  );
}
