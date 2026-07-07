import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Check, ImageIcon, QrCode, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminDeposits } from "@/hooks/use-admin-deposits";
import { fileToDataUrl, type DepositRequest } from "@/lib/payments";
import type { WithdrawalRequest } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/deposits")({
  component: AdminDeposits,
});

function AdminDeposits() {
  const {
    settings,
    requests,
    withdrawalRequests,
    isLoading,
    isError,
    refetchRequests,
    updateSettings,
    approve,
    reject,
    approveWithdrawal,
    rejectWithdrawal,
  } = useAdminDeposits();

  const [preview, setPreview] = useState<DepositRequest | null>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const onQrUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const qrImage = await fileToDataUrl(file);
      await updateSettings.mutateAsync({ qrImage });
      toast.success("Payment QR updated");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const saveDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await updateSettings.mutateAsync({
        upiId: String(fd.get("upiId") ?? ""),
        accountName: String(fd.get("accountName") ?? ""),
      });
      toast.success("Payment details saved");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approve.mutateAsync(id);
      toast.success("Deposit approved — wallet credited");
      if (preview?.id === id) setPreview(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject.mutateAsync(id);
      toast.error("Deposit rejected");
      if (preview?.id === id) setPreview(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    try {
      await rejectWithdrawal.mutateAsync(id);
      toast.success("Withdrawal rejected — balance refunded");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    try {
      await approveWithdrawal.mutateAsync(id);
      toast.success("Withdrawal approved — transfer processed");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");
  const pendingWithdrawals = withdrawalRequests.filter((r) => r.status === "pending");
  const reviewedWithdrawals = withdrawalRequests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8 p-6">
      <h1 className="font-display text-2xl font-bold">Deposits &amp; Withdrawals</h1>

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load deposit data. Check that you are signed in as admin.
        </div>
      )}

      <section className="glossy rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Payment QR code</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload the UPI QR users scan when depositing.
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 p-6">
            {isLoading ? (
              <div className="grid h-48 w-48 place-items-center text-sm text-muted-foreground">
                Loading…
              </div>
            ) : settings?.qrImage ? (
              <img
                src={settings.qrImage}
                alt="Payment QR"
                className="max-h-56 rounded-lg border border-border"
              />
            ) : (
              <div className="grid h-48 w-48 place-items-center rounded-lg bg-muted/30">
                <QrCode className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
            <input
              ref={qrRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onQrUpload(e.target.files?.[0])}
            />
            <Button
              type="button"
              className="mt-4 gold-button hover:gold-button-hover"
              onClick={() => qrRef.current?.click()}
              disabled={updateSettings.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />{" "}
              {settings?.qrImage ? "Replace QR" : "Upload QR"}
            </Button>
          </div>

          <form onSubmit={saveDetails} className="space-y-4">
            <div>
              <Label htmlFor="accountName">Account name</Label>
              <Input
                id="accountName"
                name="accountName"
                key={settings?.accountName}
                defaultValue={settings?.accountName ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                name="upiId"
                key={settings?.upiId}
                defaultValue={settings?.upiId ?? ""}
                placeholder="merchant@upi"
              />
            </div>
            <Button type="submit" variant="outline" disabled={updateSettings.isPending}>
              Save details
            </Button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">
            Pending withdrawals ({pendingWithdrawals.length})
          </h2>
          <Button variant="outline" size="sm" onClick={() => refetchRequests()}>
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="glossy-soft rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Loading withdrawal requests…
          </div>
        ) : pendingWithdrawals.length === 0 ? (
          <div className="glossy-soft rounded-2xl p-8 text-center text-sm text-muted-foreground">
            No pending withdrawal requests.
          </div>
        ) : (
          <div className="glossy overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">IFSC</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals.map((r) => (
                  <WithdrawalRow
                    key={r.id}
                    request={r}
                    onApprove={() => handleApproveWithdrawal(r.id)}
                    onReject={() => handleRejectWithdrawal(r.id)}
                    approvePending={approveWithdrawal.isPending}
                    rejectPending={rejectWithdrawal.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {reviewedWithdrawals.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold">Reviewed withdrawals</h2>
          <div className="glossy overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">IFSC</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {reviewedWithdrawals.slice(0, 20).map((r) => (
                  <tr key={r.id} className="border-t border-border/60">
                    <td className="px-4 py-3">{r.userName}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      ₹{r.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      ••••{r.accountNumber.slice(-4)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.ifsc}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs capitalize ${r.status === "approved" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Pending deposits ({pending.length})</h2>
          <Button variant="outline" size="sm" onClick={() => refetchRequests()}>
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="glossy-soft rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Loading deposit requests…
          </div>
        ) : pending.length === 0 ? (
          <div className="glossy-soft rounded-2xl p-8 text-center text-sm text-muted-foreground">
            No pending deposit requests.
          </div>
        ) : (
          <div className="glossy overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Reference ID</th>
                  <th className="px-4 py-3">Screenshot</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.userName}</div>
                      <div className="text-xs text-muted-foreground">{r.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      ₹{r.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.referenceId}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setPreview(r)}
                        className="block overflow-hidden rounded border border-border"
                      >
                        <img
                          src={r.screenshot}
                          alt="Payment proof"
                          className="h-14 w-14 object-cover"
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-[color:var(--success)] text-[color:var(--success-foreground)] hover:brightness-110"
                          onClick={() => handleApprove(r.id)}
                          disabled={approve.isPending}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[color:var(--destructive)]"
                          onClick={() => handleReject(r.id)}
                          disabled={reject.isPending}
                        >
                          <X className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {reviewed.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold">Reviewed</h2>
          <div className="glossy overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Proof</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.slice(0, 20).map((r) => (
                  <tr key={r.id} className="border-t border-border/60">
                    <td className="px-4 py-3">{r.userName}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      ₹{r.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.referenceId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-0.5 text-xs capitalize ${r.status === "approved" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => setPreview(r)}>
                        <ImageIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold">{preview.userName}</h3>
                <p className="text-sm text-muted-foreground">
                  ₹{preview.amount.toLocaleString("en-IN")} · Ref: {preview.referenceId}
                </p>
              </div>
              <button type="button" onClick={() => setPreview(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <img
              src={preview.screenshot}
              alt="Payment screenshot"
              className="mt-4 w-full rounded-lg border border-border"
            />
            {preview.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1 bg-[color:var(--success)] text-[color:var(--success-foreground)]"
                  onClick={() => handleApprove(preview.id)}
                  disabled={approve.isPending}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-[color:var(--destructive)]"
                  onClick={() => handleReject(preview.id)}
                  disabled={reject.isPending}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WithdrawalRow({
  request,
  onApprove,
  onReject,
  approvePending,
  rejectPending,
}: {
  request: WithdrawalRequest;
  onApprove: () => void;
  onReject: () => void;
  approvePending: boolean;
  rejectPending: boolean;
}) {
  return (
    <tr className="border-t border-border/60">
      <td className="px-4 py-3">
        <div className="font-medium">{request.userName}</div>
        <div className="text-xs text-muted-foreground">{request.userEmail}</div>
      </td>
      <td className="px-4 py-3 text-right font-mono">₹{request.amount.toLocaleString("en-IN")}</td>
      <td className="px-4 py-3 font-mono text-xs">••••{request.accountNumber.slice(-4)}</td>
      <td className="px-4 py-3 font-mono text-xs">{request.ifsc}</td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(request.createdAt).toLocaleString("en-IN")}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-[color:var(--success)] text-[color:var(--success-foreground)] hover:brightness-110"
            onClick={onApprove}
            disabled={approvePending}
          >
            <Check className="mr-1 h-3.5 w-3.5" /> Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-[color:var(--destructive)]"
            onClick={onReject}
            disabled={rejectPending}
          >
            <X className="mr-1 h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      </td>
    </tr>
  );
}
