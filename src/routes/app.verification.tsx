import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useVerification } from "@/hooks/use-verification";
import type { KycStepId, KycStepStatus } from "@/lib/verification-db";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/verification")({
  component: VerificationPage,
});

const STATUS_LABEL: Record<KycStepStatus, string> = {
  pending: "Pending",
  submitted: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

function OverallBanner({
  status,
}: {
  status: ReturnType<typeof useVerification>["overallStatus"];
}) {
  if (status === "approved") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 p-4 text-sm">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--success)]" />
        <div>
          <p className="font-semibold text-[color:var(--success)]">KYC verified</p>
          <p className="mt-1 text-muted-foreground">
            Your account is fully verified. Higher leverage and faster withdrawals are unlocked.
          </p>
        </div>
      </div>
    );
  }
  if (status === "action_required") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 p-4 text-sm">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--destructive)]" />
        <div>
          <p className="font-semibold text-[color:var(--destructive)]">Action required</p>
          <p className="mt-1 text-muted-foreground">
            One or more documents were rejected. Please re-upload the flagged documents below.
          </p>
        </div>
      </div>
    );
  }
  if (status === "under_review") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 p-4 text-sm">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gold)]" />
        <div>
          <p className="font-semibold">Under admin review</p>
          <p className="mt-1 text-muted-foreground">
            Your documents have been submitted. Review typically completes within 1 hour.
          </p>
        </div>
      </div>
    );
  }
  return null;
}

function VerificationPage() {
  const { steps, approvedCount, progress, overallStatus, state, submitStep, isApproved } =
    useVerification();
  const fileRefs = useRef<Partial<Record<KycStepId, HTMLInputElement | null>>>({});

  const onPick = (stepId: KycStepId) => {
    fileRefs.current[stepId]?.click();
  };

  const onFile = async (stepId: KycStepId, file: File | undefined) => {
    if (!file) return;
    try {
      await submitStep(stepId, file);
      toast.success("Document uploaded · pending admin review");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <PageShell
      eyebrow="Compliance"
      title="Account verification"
      description="Complete KYC to unlock higher leverage, faster withdrawals, and live trading."
      width="md"
    >
      <OverallBanner status={overallStatus} />

      <DataPanel
        title="Verification progress"
        description={`${approvedCount} of ${steps.length} steps approved`}
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
        {steps.map((s, i) => {
          const step = state.steps[s.id];
          const status = step.status;
          const canUpload = status === "pending" || status === "rejected";
          const showPreview = !!step.fileDataUrl && status !== "pending";

          return (
            <div
              key={s.id}
              className={cn(
                "glossy-soft flex flex-col gap-4 rounded-2xl p-5",
                status === "approved" && "ring-1 ring-[color:var(--success)]/30",
                status === "rejected" && "ring-1 ring-[color:var(--destructive)]/30",
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex flex-1 items-start gap-4">
                  <div
                    className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold",
                      status === "approved"
                        ? "bg-[color:var(--success)] text-[color:var(--success-foreground)]"
                        : status === "rejected"
                          ? "bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]"
                          : status === "submitted"
                            ? "bg-[color:var(--gold)]/15 text-[color:var(--gold)]"
                            : "bg-[color:var(--gold)]/15 text-[color:var(--gold)]",
                    )}
                  >
                    {status === "approved" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : status === "rejected" ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold">{s.title}</div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          status === "approved" && "bg-[color:var(--success)]/10 text-[color:var(--success)]",
                          status === "submitted" && "bg-[color:var(--gold)]/10 text-[color:var(--gold-deep)]",
                          status === "rejected" && "bg-[color:var(--destructive)]/10 text-[color:var(--destructive)]",
                          status === "pending" && "bg-muted text-muted-foreground",
                        )}
                      >
                        {status === "submitted" && <Clock className="h-3 w-3" />}
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</div>
                    {step.fileName && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">File: {step.fileName}</p>
                    )}
                    {step.rejectReason && status === "rejected" && (
                      <p className="mt-2 text-xs text-[color:var(--destructive)]">{step.rejectReason}</p>
                    )}
                  </div>
                </div>

                {!isApproved && (
                  <div className="shrink-0">
                    <input
                      ref={(el) => {
                        fileRefs.current[s.id] = el;
                      }}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        void onFile(s.id, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      onClick={() => onPick(s.id)}
                      disabled={!canUpload}
                      variant={canUpload ? "default" : "outline"}
                      className={cn(
                        "w-full sm:w-auto",
                        canUpload && "gold-button hover:gold-button-hover",
                      )}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {status === "rejected"
                        ? "Re-upload"
                        : status === "submitted"
                          ? "Submitted"
                          : "Upload"}
                    </Button>
                  </div>
                )}
              </div>

              {showPreview && (
                <div className="overflow-hidden rounded-xl border border-border/60 bg-surface/50 p-2">
                  {step.fileDataUrl?.startsWith("data:image") ? (
                    <img
                      src={step.fileDataUrl}
                      alt={step.fileName ?? s.title}
                      className="max-h-48 w-full rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2 px-2 py-4 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      Document on file — {step.fileName}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="glossy-soft flex items-start gap-3 rounded-2xl p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gold)]" />
        <p>
          Documents are encrypted at rest. KYC review is handled securely — uploads are reviewed by
          our compliance team.
        </p>
      </div>
    </PageShell>
  );
}
