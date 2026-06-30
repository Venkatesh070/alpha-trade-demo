import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Users2 } from "lucide-react";
import { TRADERS, type TopTrader } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/site/sparkline";
import { sparklineFor } from "@/data/markets";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/copy-trading")({
  component: CopyPage,
});

function CopyPage() {
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const toggle = (t: TopTrader) => {
    setFollowed((p) => {
      const n = new Set(p);
      if (n.has(t.id)) { n.delete(t.id); toast.success(`Unfollowed ${t.name}`); }
      else { n.add(t.id); toast.success(`Now copying ${t.name}`); }
      return n;
    });
  };

  return (
    <PageShell
      eyebrow="Social"
      title="Copy Trading"
      description="Mirror top-ranked strategists with one click. Allocate capital and track performance in real time."
      width="xl"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRADERS.map((t) => (
          <article key={t.id} className="glossy flex flex-col rounded-2xl p-5 transition-all hover:ring-gold">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--gold)] text-sm font-bold text-[color:var(--primary-foreground)] shadow-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold leading-tight">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.handle} · {t.country}</div>
                </div>
              </div>
              <StatusBadge variant={t.risk === "Low" ? "success" : t.risk === "Medium" ? "warning" : "danger"}>
                {t.risk}
              </StatusBadge>
            </div>

            <div className="mt-4 h-16 rounded-lg bg-surface/50 p-2">
              <Sparkline points={sparklineFor(t.id)} up className="h-full w-full" />
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-border/50 bg-surface/40 px-2 py-2">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">ROI</dt>
                <dd className="font-mono text-sm font-bold text-[color:var(--success)]">{t.roiYear}%</dd>
              </div>
              <div className="rounded-lg border border-border/50 bg-surface/40 px-2 py-2">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Win rate</dt>
                <dd className="font-mono text-sm font-bold">{t.winRate}%</dd>
              </div>
              <div className="rounded-lg border border-border/50 bg-surface/40 px-2 py-2">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Copiers</dt>
                <dd className="font-mono text-sm font-bold">{t.copiers.toLocaleString()}</dd>
              </div>
            </dl>

            <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">{t.strategy}</p>

            <Button
              onClick={() => toggle(t)}
              className={cn("mt-4 w-full", !followed.has(t.id) && "gold-button hover:gold-button-hover")}
              variant={followed.has(t.id) ? "outline" : "default"}
            >
              <Users2 className="mr-2 h-4 w-4" />
              {followed.has(t.id) ? "Following" : "Follow & copy"}
            </Button>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
