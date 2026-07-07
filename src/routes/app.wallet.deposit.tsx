import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Copy, ImageIcon, QrCode, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet, MIN_TRADING_BALANCE } from "@/hooks/use-wallet";
import { fileToDataUrl, getPaymentSettings, type PaymentSettings } from "@/lib/payments";
import { fetchPaymentSettings } from "@/lib/wallet-api";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";

export const Route = createFileRoute("/app/wallet/deposit")({
  component: DepositPage,
});

function DetailRow({
  label,
  value,
  mono,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface/50 px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={cn("mt-0.5 truncate text-sm font-medium", mono && "font-mono")}>
          {value}
        </div>
      </div>
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground"
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function DepositPage() {
  const [amount, setAmount] = useState("5000");
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings>(() => getPaymentSettings());
  const fileRef = useRef<HTMLInputElement>(null);
  const { submitDepositRequest } = useWallet();
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const remote = await fetchPaymentSettings();
        setSettings(remote);
      } catch {
        setSettings(getPaymentSettings());
      }
    }
    void load();
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const amt = Number(amount) || 0;
  const hasPaymentConfig = !!(settings.qrImage || settings.upiId);

  const onScreenshot = async (file: File | undefined) => {
    if (!file) return;
    try {
      setScreenshot(await fileToDataUrl(file));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!utr.trim()) {
      toast.error("Enter the UTR / transaction reference number");
      return;
    }
    if (!screenshot) {
      toast.error("Upload a payment screenshot");
      return;
    }
    if (!settings.qrImage && !settings.upiId) {
      toast.error("Payment details not configured yet. Please contact support.");
      return;
    }

    setLoading(true);
    try {
      await submitDepositRequest(amt, utr.trim(), screenshot);
      toast.success("Deposit submitted for review", {
        description: "Your balance will update once admin verifies your payment.",
      });
      nav({ to: "/app/wallet" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      eyebrow="Funds"
      title="Deposit via UPI"
      description="Enter amount, pay using the QR or UPI ID, then submit your UTR and payment screenshot."
      width="md"
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/wallet">
            <ArrowLeft className="mr-1 h-4 w-4" /> Wallet
          </Link>
        </Button>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <DataPanel title="Step 1 · Enter amount" padding={false}>
          <div className="p-4 sm:p-5">
            <Label htmlFor="amt">Amount (₹)</Label>
            <Input
              id="amt"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 font-mono text-lg"
              required
            />
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {[MIN_TRADING_BALANCE, 10000, 25000, 50000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(String(v))}
                  className={cn(
                    "rounded-md border px-3 py-1.5 font-mono transition-colors",
                    amt === v
                      ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                      : "border-border bg-surface hover:bg-accent",
                  )}
                >
                  ₹{v.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </DataPanel>

        <DataPanel title="Step 2 · Pay using these details" padding={false}>
          <div className="p-4 sm:p-5">
            {!hasPaymentConfig ? (
              <div className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center text-sm text-muted-foreground">
                Payment QR and UPI details are not set up yet. Please try again later or contact
                support.
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-surface/30 p-5">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Scan QR code
                  </div>
                  {settings.qrImage ? (
                    <img
                      src={settings.qrImage}
                      alt="UPI payment QR code"
                      className="mt-3 w-full max-w-[240px] rounded-xl border-2 border-[color:var(--gold)]/30 bg-card p-2 shadow-lg"
                    />
                  ) : (
                    <div className="mt-3 grid h-56 w-56 place-items-center rounded-xl border border-dashed border-border">
                      <QrCode className="h-14 w-14 text-muted-foreground/30" />
                    </div>
                  )}
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Open any UPI app and scan to pay
                  </p>
                </div>

                <div className="space-y-3">
                  <DetailRow
                    label="Account name"
                    value={settings.accountName}
                    onCopy={
                      settings.accountName
                        ? () => copy(settings.accountName, "Account name")
                        : undefined
                    }
                  />
                  <DetailRow
                    label="UPI ID"
                    value={settings.upiId}
                    mono
                    onCopy={settings.upiId ? () => copy(settings.upiId, "UPI ID") : undefined}
                  />
                  <div className="rounded-lg border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 px-3 py-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Amount to pay
                    </div>
                    <div className="mt-0.5 font-display text-2xl font-bold text-[color:var(--gold)]">
                      ₹{amt > 0 ? amt.toLocaleString("en-IN") : "—"}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pay exactly this amount. After payment, note the{" "}
                    <strong className="text-foreground">UTR / reference number</strong> from your
                    UPI app.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DataPanel>

        <DataPanel title="Step 3 · Submit payment proof" padding={false}>
          <div className="p-4 sm:p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="utr">UTR / transaction reference number</Label>
                <Input
                  id="utr"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g. 428901234567"
                  className="mt-1.5 font-mono"
                  required
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  12-digit UTR from GPay, PhonePe, Paytm, etc.
                </p>
              </div>

              <div>
                <Label>Payment screenshot</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onScreenshot(e.target.files?.[0])}
                />
                {screenshot ? (
                  <div className="mt-1.5 space-y-2">
                    <div className="overflow-hidden rounded-lg border border-border">
                      <img
                        src={screenshot}
                        alt="Payment screenshot"
                        className="max-h-44 w-full object-contain bg-black/20"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                    >
                      <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Change image
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mt-1.5 flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 py-10 text-sm text-muted-foreground transition-colors hover:border-[color:var(--gold)]/50 hover:bg-accent/50"
                  >
                    <Upload className="mb-2 h-7 w-7 text-[color:var(--gold)]" />
                    <span className="font-medium text-foreground">Upload payment screenshot</span>
                    <span className="mt-1 text-xs">PNG, JPG · max 2 MB</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </DataPanel>

        {(amt > 0 || utr || screenshot) && (
          <DataPanel title="Deposit summary">
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-2 sm:block">
                <dt className="text-muted-foreground">Amount</dt>
                <dd className="font-mono font-semibold">₹{amt > 0 ? amt.toLocaleString() : "—"}</dd>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <dt className="text-muted-foreground">UPI ID</dt>
                <dd className="truncate font-mono text-xs">{settings.upiId || "—"}</dd>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <dt className="text-muted-foreground">Account name</dt>
                <dd className="flex items-center gap-1 truncate">
                  <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {settings.accountName || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2 sm:block">
                <dt className="text-muted-foreground">UTR number</dt>
                <dd className="font-mono text-xs">{utr || "—"}</dd>
              </div>
              <div className="flex justify-between gap-2 sm:col-span-2 sm:block">
                <dt className="text-muted-foreground">Screenshot</dt>
                <dd>{screenshot ? "Attached" : "Not uploaded"}</dd>
              </div>
            </dl>
          </DataPanel>
        )}

        <Button
          type="submit"
          disabled={loading || !hasPaymentConfig}
          className="gold-button hover:gold-button-hover w-full py-6 text-base font-semibold"
        >
          {loading ? "Submitting…" : "Submit deposit for verification"}
        </Button>
      </form>
    </PageShell>
  );
}
