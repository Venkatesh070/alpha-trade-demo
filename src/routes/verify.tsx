import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/verify")({
  validateSearch: (s) => ({ email: (s.email as string) ?? "" }),
  head: () => ({ meta: [{ title: "Verify email — Exness India" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { email } = useSearch({ from: "/verify" });
  const { verifyOtp, sendOtp } = useAuth();
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try { await verifyOtp(email, code); toast.success("Email verified"); nav({ to: "/app" }); }
    catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto grid max-w-md gap-6 px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-extrabold">Verify your <span className="gold-text">email</span></h1>
        <p className="text-sm text-muted-foreground">We sent a 6-digit code to <strong className="text-foreground">{email || "your inbox"}</strong>. Demo tip: enter any 6 digits.</p>
        <div className="glossy mx-auto rounded-2xl p-6">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
          <Button disabled={loading || code.length !== 6} onClick={submit} className="gold-button hover:gold-button-hover mt-6 w-full">
            {loading ? "Verifying…" : "Verify"}
          </Button>
          <button onClick={() => { sendOtp(email); toast.success("Code resent"); }} className="mt-4 text-xs text-[color:var(--gold)] hover:underline">Resend code</button>
        </div>
      </div>
    </div>
  );
}
