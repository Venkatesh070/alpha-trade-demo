import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Trophy } from "lucide-react";
import { COMPETITIONS } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { GatedNumber, PriceLockBanner, usePriceAccess } from "@/components/pricing/price-gate";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/competitions")({
  component: CompetitionsPage,
});

function CompetitionsPage() {
  const { canViewPrices } = usePriceAccess();

  return (
    <PageShell
      eyebrow="Events"
      title="Competitions"
      description="Join live trading contests, climb the ranks, and win demo prizes."
      width="xl"
    >
      <PriceLockBanner />

      <div className="grid gap-4 lg:grid-cols-2">
        {COMPETITIONS.map((c) => (
          <article
            key={c.id}
            className="glossy relative overflow-hidden rounded-2xl p-6 transition-all hover:ring-gold"
          >
            <div className="flex items-center justify-between">
              <StatusBadge
                variant={
                  c.status === "live" ? "success" : c.status === "upcoming" ? "warning" : "neutral"
                }
              >
                {c.status}
              </StatusBadge>
              <Trophy className="h-5 w-5 text-[color:var(--gold)]" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">{c.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
            <dl className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/50 bg-surface/40 p-3">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Prize
                </dt>
                <dd className="mt-1 font-mono text-sm font-bold gold-text">
                  <GatedNumber value={c.prize} className="gold-text" />
                </dd>
              </div>
              <div className="rounded-xl border border-border/50 bg-surface/40 p-3">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Traders
                </dt>
                <dd className="mt-1 font-mono text-sm font-bold">
                  {c.participants.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-xl border border-border/50 bg-surface/40 p-3">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {c.status === "live" ? "Ends in" : "Starts"}
                </dt>
                <dd className="mt-1 font-mono text-sm font-bold">{c.endsIn}</dd>
              </div>
            </dl>
            {c.status === "live" && (
              <Progress
                value={canViewPrices ? 62 : 0}
                className={cn("mt-5 h-1.5", !canViewPrices && "opacity-40")}
              />
            )}
            {!canViewPrices ? (
              <Button asChild className="mt-5 w-full gold-button hover:gold-button-hover">
                <Link to="/app/wallet/deposit">
                  <Lock className="mr-2 h-4 w-4" />
                  Deposit to unlock
                </Link>
              </Button>
            ) : (
              <Button className="mt-5 w-full gold-button hover:gold-button-hover">
                {c.status === "live" ? "Join now" : "Register interest"}
              </Button>
            )}
          </article>
        ))}
      </div>
    </PageShell>
  );
}
