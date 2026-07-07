import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Eye, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  approveAllKyc,
  approveKycStep,
  getKycOverallStatus,
  isKycApproved,
  KYC_STEPS,
  listAllKycRecords,
  listKycQueue,
  rejectAllKyc,
  rejectKycStep,
  type KycQueueItem,
  type KycStepId,
} from "@/lib/verification-db";
import { pushNotification } from "@/lib/notifications-db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/kyc")({
  component: AdminKyc,
});

function statusClass(status: string) {
  switch (status) {
    case "approved":
      return "bg-[color:var(--success)]/15 text-[color:var(--success)]";
    case "under_review":
      return "bg-[color:var(--gold)]/15 text-[color:var(--gold-deep)]";
    case "action_required":
      return "bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "approved":
      return "Verified";
    case "under_review":
      return "Under review";
    case "action_required":
      return "Action required";
    case "in_progress":
      return "In progress";
    default:
      return status;
  }
}

function AdminKyc() {
  const [queue, setQueue] = useState<KycQueueItem[]>(() => listKycQueue());
  const [all, setAll] = useState<KycQueueItem[]>(() => listAllKycRecords());
  const [selected, setSelected] = useState<KycQueueItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const reload = () => {
    setQueue(listKycQueue());
    setAll(listAllKycRecords());
    if (selected) {
      const fresh = listAllKycRecords().find((r) => r.email === selected.email);
      setSelected(fresh ?? null);
    }
  };

  const notifyUser = (email: string, title: string, body: string) => {
    pushNotification(email, { type: "verification", title, body });
  };

  const approveStep = (email: string, stepId: KycStepId) => {
    const next = approveKycStep(email, stepId);
    const step = KYC_STEPS.find((s) => s.id === stepId);
    if (isKycApproved(next)) {
      notifyUser(email, "KYC approved", "Your account is fully verified.");
      toast.success("Full KYC approved");
    } else {
      notifyUser(email, "Document approved", `${step?.title ?? "KYC document"} has been approved.`);
      toast.success("Document approved");
    }
    reload();
  };

  const rejectStep = (email: string, stepId: KycStepId) => {
    rejectKycStep(email, stepId, rejectReason);
    const step = KYC_STEPS.find((s) => s.id === stepId);
    notifyUser(
      email,
      "Document rejected",
      `${step?.title ?? "KYC document"} was rejected. ${rejectReason || "Please re-upload."}`,
    );
    setRejectReason("");
    reload();
    toast.error("Document rejected");
  };

  const approveAll = (email: string) => {
    approveAllKyc(email);
    notifyUser(email, "KYC approved", "Your account is fully verified.");
    reload();
    toast.success("Full KYC approved");
    setSelected(null);
  };

  const rejectAll = (email: string) => {
    rejectAllKyc(email, rejectReason);
    notifyUser(
      email,
      "KYC rejected",
      rejectReason || "Your KYC submission could not be verified. Please re-upload your documents.",
    );
    setRejectReason("");
    reload();
    toast.error("KYC rejected");
    setSelected(null);
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="font-display text-2xl font-bold">KYC verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review user identity documents and approve or reject submissions.
        </p>
      </div>

      <section className="glossy rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold">Pending review ({queue.length})</h2>
          <Button type="button" variant="outline" size="sm" onClick={reload}>
            Refresh
          </Button>
        </div>

        {queue.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No KYC submissions awaiting review.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Pending docs</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={item.email} className="border-t border-border/60">
                    <td className="px-4 py-3 font-sans font-medium">{item.userName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{item.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded px-2 py-0.5 text-xs", statusClass(item.overallStatus))}>
                        {statusLabel(item.overallStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{item.pendingReviewCount}</td>
                    <td className="px-4 py-3 text-right">
                      <Button type="button" size="sm" variant="outline" onClick={() => setSelected(item)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="glossy rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">All KYC records</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {all.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No KYC submissions yet.
                  </td>
                </tr>
              ) : (
                all.map((item) => {
                  const approved = KYC_STEPS.filter(
                    (s) => item.state.steps[s.id].status === "approved",
                  ).length;
                  return (
                    <tr key={item.email} className="border-t border-border/60">
                      <td className="px-4 py-3 font-sans">{item.userName}</td>
                      <td className="px-4 py-3 font-mono text-xs">{item.email}</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded px-2 py-0.5 text-xs", statusClass(item.overallStatus))}>
                          {statusLabel(item.overallStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {approved}/{KYC_STEPS.length}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button type="button" size="sm" variant="ghost" onClick={() => setSelected(item)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-bold">{selected.userName}</h3>
                <p className="mt-1 font-mono text-sm text-muted-foreground">{selected.email}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Status: {statusLabel(getKycOverallStatus(selected.state))}
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setSelected(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="rejectReason">Rejection note (optional)</Label>
              <Input
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason shown to the user if rejecting"
              />
            </div>

            <div className="mt-6 space-y-4">
              {KYC_STEPS.map((meta) => {
                const step = selected.state.steps[meta.id];
                return (
                  <div key={meta.id} className="rounded-xl border border-border/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{meta.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Status: {step.status}
                          {step.fileName ? ` · ${step.fileName}` : ""}
                        </p>
                        {step.rejectReason && (
                          <p className="mt-1 text-xs text-[color:var(--destructive)]">{step.rejectReason}</p>
                        )}
                      </div>
                      {step.status === "submitted" && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="bg-[color:var(--success)] text-[color:var(--success-foreground)] hover:brightness-110"
                            onClick={() => approveStep(selected.email, meta.id)}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => rejectStep(selected.email, meta.id)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                    {step.fileDataUrl && (
                      <div className="mt-3 overflow-hidden rounded-lg border border-border/60 bg-surface/40 p-2">
                        {step.fileDataUrl.startsWith("data:image") ? (
                          <img
                            src={step.fileDataUrl}
                            alt={step.fileName ?? meta.title}
                            className="max-h-56 w-full object-contain"
                          />
                        ) : (
                          <div className="flex items-center gap-2 px-2 py-6 text-sm text-muted-foreground">
                            <ShieldCheck className="h-4 w-4" />
                            PDF document uploaded
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-border/60 pt-4">
              <Button
                type="button"
                className="bg-[color:var(--success)] text-[color:var(--success-foreground)] hover:brightness-110"
                onClick={() => approveAll(selected.email)}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve full KYC
              </Button>
              <Button type="button" variant="outline" onClick={() => rejectAll(selected.email)}>
                <X className="mr-2 h-4 w-4" />
                Reject submission
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
