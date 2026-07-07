import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthLoading } from "@/components/auth/auth-loading";
import { useAuth } from "@/hooks/use-auth";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { applyEmailVerificationFromUrl } from "@/lib/email-verification";
import { mapFirebaseAuthError } from "@/lib/firebase-errors";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/verify")({
  validateSearch: (s) => ({ email: (s.email as string) ?? "" }),
  head: () => ({ meta: [{ title: "Verify email — Exness India" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { email } = useSearch({ from: "/verify" });
  const { loading, isAuthenticated, needsEmailVerification, user } = useAuth();
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

  if (loading) return <AuthLoading />;
  if (isAdmin) return null;

  const displayEmail = email || user?.email || "your inbox";

  return (
    <VerifyContent
      email={displayEmail}
      needsVerification={needsEmailVerification || !!email}
    />
  );
}

function VerifyContent({ email, needsVerification }: { email: string; needsVerification: boolean }) {
  const { resendVerificationEmail, confirmEmailVerified } = useAuth();
  const nav = useNavigate();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [applyingLink, setApplyingLink] = useState(true);
  const [linkApplied, setLinkApplied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const applied = await applyEmailVerificationFromUrl();
        if (applied && !cancelled) {
          setLinkApplied(true);
          const verified = await confirmEmailVerified();
          if (verified) {
            toast.success("Email verified — welcome!");
            nav({ to: "/app" });
          }
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(mapFirebaseAuthError(e));
        }
      } finally {
        if (!cancelled) {
          setApplyingLink(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nav, confirmEmailVerified]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success("Verification link sent again");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setResending(false);
    }
  };

  const handleContinue = async () => {
    setChecking(true);
    try {
      const verified = await confirmEmailVerified();
      if (verified) {
        toast.success("Email verified — welcome!");
        nav({ to: "/app" });
      } else {
        toast.error("Email not verified yet. Click the link in your inbox first.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setChecking(false);
    }
  };

  if (applyingLink) {
    return <AuthLoading />;
  }

  return (
    <AuthShell active="signup">
      <div className="space-y-6 text-center">
        <div
          className={cn(
            "mx-auto grid h-16 w-16 place-items-center rounded-full",
            linkApplied ? "bg-[#22c55e]/15" : "bg-[#ffde02]/20",
          )}
        >
          {linkApplied ? (
            <CheckCircle2 className="h-8 w-8 text-[#22c55e]" />
          ) : (
            <MailCheck className="h-8 w-8 text-[#141d22]" />
          )}
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold">
            {linkApplied ? "Email verified" : "Verify your email"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#141d22]/60">
            {linkApplied ? (
              "Your email is confirmed. Redirecting you to the platform…"
            ) : (
              <>
                We sent a verification link to{" "}
                <strong className="text-[#141d22]">{email}</strong>. Open the email and click
                &quot;Verify Email Address&quot; to activate your account.
              </>
            )}
          </p>
        </div>

        {!linkApplied && (
          <>
            <button
              type="button"
              disabled={checking}
              onClick={handleContinue}
              className={cn(
                "inline-flex h-11 w-full items-center justify-center rounded",
                "bg-[#ffde02] text-sm font-semibold text-black",
                "transition-colors hover:bg-[#ffe535] disabled:opacity-60",
              )}
            >
              {checking ? "Checking…" : "I've verified — continue"}
            </button>

            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="text-sm text-[#158bf9] hover:underline disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend verification email"}
            </button>
          </>
        )}

        {!needsVerification && !linkApplied && (
          <p className="text-xs text-[#141d22]/50">
            Wrong email?{" "}
            <Link to="/register" search={{ step: "form" }} className="text-[#158bf9] hover:underline">
              Register again
            </Link>
          </p>
        )}
      </div>
    </AuthShell>
  );
}
