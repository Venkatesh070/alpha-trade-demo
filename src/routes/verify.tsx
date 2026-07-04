import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { AuthLoading } from "@/components/auth/auth-loading";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { applyEmailVerificationFromUrl } from "@/lib/email-verification";
import { mapFirebaseAuthError } from "@/lib/firebase-errors";

export const Route = createFileRoute("/verify")({
  validateSearch: (s) => ({ email: (s.email as string) ?? "" }),
  head: () => ({ meta: [{ title: "Verify email — Exness India" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { email } = useSearch({ from: "/verify" });
  const { loading, isAuthenticated, needsEmailVerification, user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      nav({ to: "/app" });
    }
  }, [loading, isAuthenticated, nav]);

  if (loading) return <AuthLoading />;

  const displayEmail = email || user?.email || "your inbox";

  return <VerifyContent email={displayEmail} needsVerification={needsEmailVerification || !!email} />;
}

function VerifyContent({ email, needsVerification }: { email: string; needsVerification: boolean }) {
  const { resendVerificationEmail, confirmEmailVerified } = useAuth();
  const nav = useNavigate();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [applyingLink, setApplyingLink] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const applied = await applyEmailVerificationFromUrl();
        if (applied && !cancelled) {
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
  }, [nav]);

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
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto grid max-w-md gap-6 px-4 py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color:var(--gold)]/15">
          <MailCheck className="h-8 w-8 text-[color:var(--gold)]" />
        </div>
        <h1 className="font-display text-3xl font-extrabold">
          Verify your <span className="gold-text">email</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <strong className="text-foreground">{email}</strong>. Open the email and click the link,
          then return here and press continue.
        </p>
        <div className="glossy mx-auto w-full rounded-2xl p-6">
          <Button
            disabled={checking}
            onClick={handleContinue}
            className="gold-button hover:gold-button-hover w-full"
          >
            {checking ? "Checking…" : "I've verified — continue"}
          </Button>
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="mt-4 text-xs text-[color:var(--gold)] hover:underline disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend verification email"}
          </button>
          {!needsVerification && (
            <p className="mt-4 text-xs text-muted-foreground">
              Wrong email?{" "}
              <Link to="/register" className="text-[color:var(--gold)] hover:underline">
                Register again
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
