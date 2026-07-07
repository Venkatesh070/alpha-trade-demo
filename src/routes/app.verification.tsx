import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useVerification } from "@/hooks/use-verification";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/verification")({
  component: VerificationPage,
});

function VerificationPage() {
  const { steps, completedCount, progress, fullySubmitted, state, submitStep } = useVerification();

  const mark = (id: (typeof steps)[number]["id"]) => {
    if (state.steps[id] !== "pending") return;
    submitStep(id);
    toast.success("Document uploaded · review in ~1 hour");
  };

  return (
    <PageShell
      eyebrow="Compliance"
      title="Account verification"
      description="Complete KYC to unlock higher leverage, faster withdrawals, and live trading."
      width="md"
    >
      <DataPanel
        title="Verification progress"
        description={`${completedCount} of ${steps.length} steps complete`}
      >
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Overall progress</span>
          <span className="font-mono font-semibold text-[color:var(--gold)]">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[color:var(--gold-deep)] to-[color:var(--gold)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {fullySubmitted && (
          <p className="mt-3 text-xs text-[color:var(--success)]">
            All documents submitted — your KYC is under review.
          </p>
        )}
      </DataPanel>

      <div className="space-y-3">
        {steps.map((s, i) => {
          const status = state.steps[s.id];
          const done = status !== "pending";
          return (
            <div
              key={s.id}
              className={cn(
                "glossy-soft flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center",
                done && "ring-1 ring-[color:var(--success)]/30",
              )}
            >
              <div className="flex flex-1 items-center gap-4">
                <div
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold",
                    done
                      ? "bg-[color:var(--success)] text-[color:var(--success-foreground)]"
                      : "bg-[color:var(--gold)]/15 text-[color:var(--gold)]",
                  )}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold">{s.title}</div>
                    {status === "submitted" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--gold)]/10 px-2 py-0.5 text-[10px] font-medium text-[color:var(--gold-deep)]">
                        <Clock className="h-3 w-3" />
                        Under review
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</div>
                </div>
              </div>
              <Button
                onClick={() => mark(s.id)}
                disabled={done}
                variant={done ? "outline" : "default"}
                className={cn(
                  "shrink-0 sm:w-auto",
                  !done && "gold-button hover:gold-button-hover",
                )}
              >
                <Upload className="mr-2 h-4 w-4" />
                {done ? "Submitted" : "Upload"}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="glossy-soft flex items-start gap-3 rounded-2xl p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gold)]" />
        <p>
          Documents are encrypted at rest. KYC review is handled securely — no identity data is
          transmitted.
        </p>
      </div>
    </PageShell>
  );
}
