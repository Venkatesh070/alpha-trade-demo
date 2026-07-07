import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { EmailVerifyOtpStep } from "@/components/auth/email-verify-otp-step";
import { useAuth } from "@/hooks/use-auth";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { applyEmailVerificationFromUrl } from "@/lib/email-verification";
import { mapFirebaseAuthError } from "@/lib/firebase-errors";
import { toast } from "sonner";

export const Route = createFileRoute("/verify")({
  validateSearch: (s) => ({
    email: (s.email as string) ?? "",
    step: (s.step as string) === "otp" ? ("otp" as const) : undefined,
  }),
  head: () => ({ meta: [{ title: "Verify email — Exness India" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { email, step } = useSearch({ from: "/verify" });
  const { loading, isAuthenticated, user, sendLoginOtp } = useAuth();
  const { isAuthenticated: isAdmin } = useAdminAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && isAdmin) {
      nav({ to: "/admin" });
      return;
    }
    if (!loading && isAuthenticated) {
      nav({ to: "/app" });
    }
  }, [loading, isAuthenticated, isAdmin, nav]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const applied = await applyEmailVerificationFromUrl();
        if (applied && !cancelled) {
          toast.success("Email verified — welcome!");
          nav({ to: "/app" });
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(mapFirebaseAuthError(e));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nav]);

  useEffect(() => {
    if (loading) return;
    if (!email && !user?.email && step !== "otp") {
      nav({ to: "/login", search: { step: "form" } });
    }
  }, [loading, email, user?.email, step, nav]);

  if (loading) return <AuthLoading />;
  if (isAdmin) return null;

  const displayEmail = email || user?.email || "";
  if (!displayEmail) return <AuthLoading />;

  return (
    <EmailVerifyOtpStep
      email={displayEmail}
      backTo={{ to: "/login", search: { step: "form" } }}
      onVerified={() => {
        void (async () => {
          try {
            await sendLoginOtp();
            toast.message("Enter the sign-in code sent to your email");
          } catch {
            // user can resend from the login OTP screen
          }
          nav({
            to: "/login",
            search: { step: "otp", email: displayEmail, redirect: "/app" },
          });
        })();
      }}
    />
  );
}
