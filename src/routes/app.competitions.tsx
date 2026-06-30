import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { COMPETITIONS } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/competitions")({
  component: CompetitionsPage,
});

function CompetitionsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Competitions</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        {COMPETITIONS.map((c) => (
          <div key={c.id} className="glossy relative overflow-hidden rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] uppercase", c.status === "live" ? "bg-[color:var(--success)]/20 text-[color:var(--success)]" : c.status === "upcoming" ? "bg-[color:var(--warning)]/20 text-[color:var(--warning)]" : "bg-accent text-muted-foreground")}>{c.status}</span>
              <Trophy className="h-5 w-5 text-[color:var(--gold)]" />
            </div>
            <h2 className="mt-3 font-display text-xl font-bold">{c.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
              <div><div className="text-muted-foreground">Prize</div><div className="font-mono text-base font-bold gold-text">{c.prize}</div></div>
              <div><div className="text-muted-foreground">Traders</div><div className="font-mono text-base">{c.participants.toLocaleString()}</div></div>
              <div><div className="text-muted-foreground">{c.status === "live" ? "Ends in" : "Starts"}</div><div className="font-mono text-base">{c.endsIn}</div></div>
            </div>
            {c.status === "live" && <Progress value={62} className="mt-4 h-1.5" />}
            <Button className="mt-5 gold-button hover:gold-button-hover">{c.status === "live" ? "Join now" : "Register interest"}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
