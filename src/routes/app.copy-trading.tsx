import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { TRADERS, type TopTrader } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/site/sparkline";
import { sparklineFor } from "@/data/markets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/copy-trading")({
  component: CopyPage,
});

function CopyPage() {
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const toggle = (t: TopTrader) => {
    setFollowed((p) => { const n = new Set(p); if (n.has(t.id)) { n.delete(t.id); toast.success(`Unfollowed ${t.name}`); } else { n.add(t.id); toast.success(`Now copying ${t.name}`); } return n; });
  };
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Copy Trading</h1>
      <p className="text-sm text-muted-foreground">Mirror the trades of top-ranked strategists with one click.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRADERS.map((t) => (
          <div key={t.id} className="glossy rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--gold)] text-sm font-bold text-[color:var(--primary-foreground)]">{t.name[0]}</div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.handle} · {t.country}</div>
                </div>
              </div>
              <span className={cn("rounded px-2 py-0.5 text-[11px] uppercase",
                t.risk === "Low" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" :
                t.risk === "Medium" ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]" :
                "bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]")}>{t.risk}</span>
            </div>
            <div className="mt-4 h-16"><Sparkline points={sparklineFor(t.id)} up className="h-full w-full" /></div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div><div className="text-muted-foreground">ROI</div><div className="font-mono text-base font-bold text-[color:var(--success)]">{t.roiYear}%</div></div>
              <div><div className="text-muted-foreground">Win rate</div><div className="font-mono text-base">{t.winRate}%</div></div>
              <div><div className="text-muted-foreground">Copiers</div><div className="font-mono text-base">{t.copiers.toLocaleString()}</div></div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{t.strategy}</div>
            <Button onClick={() => toggle(t)} className={"mt-4 w-full " + (followed.has(t.id) ? "" : "gold-button hover:gold-button-hover")} variant={followed.has(t.id) ? "outline" : "default"}>
              {followed.has(t.id) ? "Following" : "Follow & copy"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
