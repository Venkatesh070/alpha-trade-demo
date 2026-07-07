import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, authInputClass, authLabelClass } from "@/components/auth/auth-shell";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Exness India" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
      toast.success("If an account exists, a reset link has been sent.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell active="signin">
      {sent ? (
        <div className="space-y-4 text-center">
          <h2 className="font-display text-xl font-bold">Check your email</h2>
          <p className="text-sm leading-relaxed text-[#141d22]/60">
            If an account exists for <strong className="text-[#141d22]">{email}</strong>, we sent a
            password reset link. Open the email and click the link to set a new password.
          </p>
          <p className="text-xs text-[#141d22]/50">The link expires in 1 hour.</p>
          <Link
            to="/login"
            search={{ step: "form" }}
            className="inline-flex h-11 w-full items-center justify-center rounded bg-[#ffde02] text-sm font-semibold text-black hover:bg-[#ffe535]"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="text-center">
            <h2 className="font-display text-xl font-bold">Forgot password</h2>
            <p className="mt-2 text-sm text-[#141d22]/60">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <div>
            <label htmlFor="email" className={authLabelClass}>
              Your email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={authInputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center rounded",
              "bg-[#ffde02] text-sm font-semibold text-black",
              "transition-colors hover:bg-[#ffe535] disabled:opacity-60",
            )}
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>

          <p className="text-center text-sm text-[#141d22]/60">
            Remembered it?{" "}
            <Link to="/login" search={{ step: "form" }} className="text-[#158bf9] hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
