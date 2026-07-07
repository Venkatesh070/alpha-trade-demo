import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell, authInputClass, authLabelClass } from "@/components/auth/auth-shell";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  cleanPasswordResetUrl,
  completePasswordReset,
  getPasswordResetCodeFromUrl,
  verifyPasswordResetFromUrl,
} from "@/lib/password-reset";
import { mapFirebaseAuthError } from "@/lib/firebase-errors";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s) => ({ email: (s.email as string) ?? "" }),
  head: () => ({ meta: [{ title: "Set a new password — Exness India" }] }),
  component: ResetPage,
});

function ResetPage() {
  const { email: emailFromSearch } = useSearch({ from: "/reset-password" });
  const nav = useNavigate();
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [email, setEmail] = useState(emailFromSearch);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const code = getPasswordResetCodeFromUrl();
      if (!code) {
        setInvalidLink(true);
        setLoading(false);
        return;
      }

      try {
        const result = await verifyPasswordResetFromUrl();
        if (cancelled || !result) {
          setInvalidLink(true);
          return;
        }
        setOobCode(result.oobCode);
        setEmail(result.email || emailFromSearch);
        cleanPasswordResetUrl(result.email || emailFromSearch);
      } catch (e) {
        if (!cancelled) {
          setInvalidLink(true);
          toast.error(mapFirebaseAuthError(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [emailFromSearch]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    if (pw !== pw2) return toast.error("Passwords don't match");

    setSubmitting(true);
    try {
      await completePasswordReset(oobCode, pw, email);
      toast.success("Password updated — you can sign in now");
      nav({ to: "/login", search: { step: "form" } });
    } catch (err) {
      toast.error(mapFirebaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthShell active="signin">
        <p className="text-center text-sm text-[#141d22]/60">Validating reset link…</p>
      </AuthShell>
    );
  }

  if (invalidLink || !oobCode) {
    return (
      <AuthShell active="signin">
        <div className="space-y-4 text-center">
          <h2 className="font-display text-xl font-bold">Link expired or invalid</h2>
          <p className="text-sm text-[#141d22]/60">
            This password reset link has expired or was already used. Request a new one below.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex h-11 w-full items-center justify-center rounded bg-[#ffde02] text-sm font-semibold text-black hover:bg-[#ffe535]"
          >
            Request new reset link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell active="signin">
      <form onSubmit={submit} className="space-y-5">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold">Set a new password</h2>
          <p className="mt-2 text-sm text-[#141d22]/60">
            Choose a strong password for <strong className="text-[#141d22]">{email}</strong>
          </p>
        </div>

        <div>
          <label htmlFor="pw" className={authLabelClass}>
            New password
          </label>
          <div className="relative">
            <input
              id="pw"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              className={cn(authInputClass, "pr-10")}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#141d22]/40 hover:text-[#141d22]"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="pw2" className={authLabelClass}>
            Confirm password
          </label>
          <input
            id="pw2"
            type="password"
            autoComplete="new-password"
            className={authInputClass}
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "inline-flex h-11 w-full items-center justify-center rounded",
            "bg-[#ffde02] text-sm font-semibold text-black",
            "transition-colors hover:bg-[#ffe535] disabled:opacity-60",
          )}
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
