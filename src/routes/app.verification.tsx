import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/verification")({
  component: VerificationPage,
});

const STEPS = [
  {
    id: "identity",
    title: "Identity verification",
    desc: "Upload Aadhaar or Passport — front and back.",
  },
  {
    id: "address",
    title: "Proof of address",
    desc: "Recent utility bill or bank statement (within 3 months).",
  },
  { id: "pan", title: "PAN card", desc: "Required for tax compliance on live accounts." },
];

function VerificationPage() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const progress = Math.round((done.size / STEPS.length) * 100);

  const mark = (id: string) => {
    setDone((p) => {
      const n = new Set(p);
      n.add(id);
      return n;
    });
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
        description={`${done.size} of ${STEPS.length} steps complete`}
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
      </DataPanel>

      <div className="space-y-3">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "glossy-soft flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center",
              done.has(s.id) && "ring-1 ring-[color:var(--success)]/30",
            )}
          >
            <div className="flex flex-1 items-center gap-4">
              <div
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold",
                  done.has(s.id)
                    ? "bg-[color:var(--success)] text-[color:var(--success-foreground)]"
                    : "bg-[color:var(--gold)]/15 text-[color:var(--gold)]",
                )}
              >
                {done.has(s.id) ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
              </div>
              <div>
                <div className="font-semibold">{s.title}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</div>
              </div>
            </div>
            <Button
              onClick={() => mark(s.id)}
              variant={done.has(s.id) ? "outline" : "default"}
              className={cn(
                "shrink-0 sm:w-auto",
                !done.has(s.id) && "gold-button hover:gold-button-hover",
              )}
            >
              <Upload className="mr-2 h-4 w-4" />
              {done.has(s.id) ? "Re-upload" : "Upload"}
            </Button>
          </div>
        ))}
      </div>

      <div className="glossy-soft flex items-start gap-3 rounded-2xl p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gold)]" />
        <p>
          Documents are encrypted at rest. Demo KYC is simulated — no real identity data is
          transmitted.
        </p>
      </div>
    </PageShell>
  );
}
