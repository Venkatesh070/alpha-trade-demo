import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthOtpShell } from "@/components/auth/auth-otp-shell";
import { OtpVerifyPanel } from "@/components/auth/otp-verify-panel";
import { useAuth, getAuthIdToken } from "@/hooks/use-auth";
import { mailGetRegistrationOtpResend } from "@/lib/mail-api";

interface EmailVerifyOtpStepProps {
  email: string;
  backTo: { to: string; search?: Record<string, unknown> };
  onVerified: () => void;
}

export function EmailVerifyOtpStep({ email, backTo, onVerified }: EmailVerifyOtpStepProps) {
  const { sendRegistrationOtp, verifyRegistrationOtp, confirmEmailVerified, user } = useAuth();
  const nav = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendInSeconds, setResendInSeconds] = useState(0);
  const [otpAttempt, setOtpAttempt] = useState(0);

  const displayEmail = email || user?.email || "";

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const idToken = await getAuthIdToken();
      if (!idToken && !cancelled) {
        nav({ to: backTo.to, search: backTo.search });
        return;
      }

      if (!idToken || cancelled) return;
      try {
        const { resendInSeconds: seconds } = await mailGetRegistrationOtpResend(idToken);
        if (!cancelled) setResendInSeconds(seconds);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nav, backTo]);

  useEffect(() => {
    if (resendInSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendInSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendInSeconds]);

  const handleVerify = useCallback(
    async (code: string) => {
      if (!displayEmail || verifying) return;
      setVerifying(true);
      try {
        await verifyRegistrationOtp(code);
        const verified = await confirmEmailVerified();
        if (!verified) {
          throw new Error("Email verification did not complete. Try again.");
        }
        toast.success("Email verified — welcome!");
        onVerified();
      } catch (e) {
        toast.error((e as Error).message);
        setOtpAttempt((a) => a + 1);
      } finally {
        setVerifying(false);
      }
    },
    [displayEmail, verifying, verifyRegistrationOtp, confirmEmailVerified, onVerified],
  );

  const handleResend = async () => {
    setResending(true);
    try {
      const seconds = await sendRegistrationOtp();
      setResendInSeconds(seconds);
      toast.success("New code sent to your email");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setResending(false);
    }
  };

  if (!displayEmail) return null;

  return (
    <AuthOtpShell backTo={backTo}>
      <OtpVerifyPanel
        key={otpAttempt}
        email={displayEmail}
        title="Enter code"
        subtitle="Verify your email"
        description={
          <>
            Enter the 6-digit code sent to your email{" "}
            <span className="font-medium text-[#141d22]">{displayEmail}</span>.
          </>
        }
        verifying={verifying}
        loading={resending}
        resendInSeconds={resendInSeconds}
        showTrustDevice={false}
        onVerify={handleVerify}
        onResend={handleResend}
      />
    </AuthOtpShell>
  );
}
