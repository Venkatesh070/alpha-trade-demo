import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Check, ImageIcon, QrCode, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  approveDepositRequest,
  fileToDataUrl,
  getDepositRequests,
  getPaymentSettings,
  rejectDepositRequest,
  savePaymentSettings,
  type DepositRequest,
  type PaymentSettings,
} from "@/lib/payments";

export const Route = createFileRoute("/admin/deposits")({
  component: AdminDeposits,
});

function AdminDeposits() {
  const [settings, setSettings] = useState<PaymentSettings>(() => getPaymentSettings());
  const [requests, setRequests] = useState<DepositRequest[]>(() => getDepositRequests());
  const [preview, setPreview] = useState<DepositRequest | null>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const reload = () => setRequests(getDepositRequests());

  const onQrUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const qrImage = await fileToDataUrl(file);
      const next = savePaymentSettings({ qrImage });
      setSettings(next);
      toast.success("Payment QR updated");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const saveDetails = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = savePaymentSettings({
      upiId: String(fd.get("upiId") ?? ""),
      accountName: String(fd.get("accountName") ?? ""),
    });
    setSettings(next);
    toast.success("Payment details saved");
  };

  const approve = (id: string) => {
    approveDepositRequest(id);
    reload();
    toast.success("Deposit approved — wallet credited");
    if (preview?.id === id) setPreview(null);
  };

  const reject = (id: string) => {
    rejectDepositRequest(id);
    reload();
    toast.error("Deposit rejected");
    if (preview?.id === id) setPreview(null);
  };

  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8 p-6">
      <h1 className="font-display text-2xl font-bold">Deposits &amp; payment QR</h1>

      <section className="glossy rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold">Payment QR code</h2>
        <p className="mt-1 text-sm text-muted-foreground">Upload the UPI QR users scan when depositing.</p>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 p-6">
            {settings.qrImage ? (
              <img src={settings.qrImage} alt="Payment QR" className="max-h-56 rounded-lg border border-border" />
            ) : (
              <div className="grid h-48 w-48 place-items-center rounded-lg bg-muted/30">
                <QrCode className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
            <input ref={qrRef} type="file" accept="image/*" className="hidden" onChange={(e) => onQrUpload(e.target.files?.[0])} />
            <Button type="button" className="mt-4 gold-button hover:gold-button-hover" onClick={() => qrRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> {settings.qrImage ? "Replace QR" : "Upload QR"}
            </Button>
          </div>

          <form onSubmit={saveDetails} className="space-y-4">
            <div>
              <Label htmlFor="accountName">Account name</Label>
              <Input id="accountName" name="accountName" defaultValue={settings.accountName} />
            </div>
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input id="upiId" name="upiId" defaultValue={settings.upiId} placeholder="merchant@upi" />
            </div>
            <Button type="submit" variant="outline">Save details</Button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Pending deposits ({pending.length})</h2>
          <Button variant="outline" size="sm" onClick={reload}>Refresh</Button>
        </div>

        {pending.length === 0 ? (
          <div className="glossy-soft rounded-2xl p-8 text-center text-sm text-muted-foreground">No pending deposit requests.</div>
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
                    <td className="px-4 py-3 text-right font-mono">₹{r.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.referenceId}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => setPreview(r)} className="block overflow-hidden rounded border border-border">
                        <img src={r.screenshot} alt="Payment proof" className="h-14 w-14 object-cover" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-[color:var(--success)] text-[color:var(--success-foreground)] hover:brightness-110" onClick={() => approve(r.id)}>
                          <Check className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-[color:var(--destructive)]" onClick={() => reject(r.id)}>
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
                    <td className="px-4 py-3 text-right font-mono">₹{r.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.referenceId}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs capitalize ${r.status === "approved" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]"}`}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(null)}>
          <div className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border border-border bg-background p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold">{preview.userName}</h3>
                <p className="text-sm text-muted-foreground">₹{preview.amount.toLocaleString()} · Ref: {preview.referenceId}</p>
              </div>
              <button type="button" onClick={() => setPreview(null)}><X className="h-5 w-5" /></button>
            </div>
            <img src={preview.screenshot} alt="Payment screenshot" className="mt-4 w-full rounded-lg border border-border" />
            {preview.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <Button className="flex-1 bg-[color:var(--success)] text-[color:var(--success-foreground)]" onClick={() => approve(preview.id)}>Approve</Button>
                <Button variant="outline" className="flex-1 text-[color:var(--destructive)]" onClick={() => reject(preview.id)}>Reject</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
