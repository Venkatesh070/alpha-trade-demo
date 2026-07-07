import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { AuthShell, GoogleAuthButton, authInputClass, authLabelClass } from "@/components/auth/auth-shell";
import { AuthOtpShell } from "@/components/auth/auth-otp-shell";
import { OtpVerifyPanel } from "@/components/auth/otp-verify-panel";
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed";
import { useAuth } from "@/hooks/use-auth";
import { useGoogleSignIn } from "@/hooks/use-google-sign-in";
import { cn } from "@/lib/utils";
import { userLoginOtpResendStatus } from "@/lib/auth-api";
import { sanitizeAuthRedirect } from "@/lib/auth-redirect";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type FormVals = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  validateSearch: (s) => ({
    redirect: sanitizeAuthRedirect(typeof s.redirect === "string" ? s.redirect : undefined),
    step:
      (s.step as string) === "form"
        ? ("form" as const)
        : (s.step as string) === "otp"
          ? ("otp" as const)
          : undefined,
    email: typeof s.email === "string" ? s.email : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — Exness India" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { step } = useSearch({ from: "/login" });

  return (
    <RedirectIfAuthed>
      {step === "otp" ? <LoginOtpStep /> : step === "form" ? <LoginForm /> : <AuthGate />}
    </RedirectIfAuthed>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const nav = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const { handleGoogleSignIn, googleLoading } = useGoogleSignIn({ redirect });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (vals: FormVals) => {
    setLoading(true);
    try {
      await login(vals.email, vals.password);
      toast.message("Enter the 6-digit code sent to your email");
      nav({ to: "/login", search: { step: "otp", email: vals.email, redirect } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell active="signin">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className={authLabelClass}>
            Your email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={authInputClass}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-[#e5494d]">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className={authLabelClass}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              className={cn(authInputClass, "pr-10")}
              {...form.register("password")}
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
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-[#e5494d]">{form.formState.errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "mt-2 inline-flex h-11 w-full items-center justify-center rounded",
            "bg-[#ffde02] text-sm font-semibold text-black",
            "transition-colors hover:bg-[#ffe535] active:bg-[#d1b500] disabled:opacity-60",
          )}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-[#141d22]/10" />
          <span className="text-xs text-[#141d22]/50">Or sign in with</span>
          <span className="h-px flex-1 bg-[#141d22]/10" />
        </div>

        <GoogleAuthButton
          label="Google"
          onClick={handleGoogleSignIn}
          loading={googleLoading}
          disabled={loading}
        />

        <p className="pt-2 text-center">
          <Link to="/forgot-password" className="text-sm text-[#158bf9] hover:underline">
            I forgot my password
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

function LoginOtpStep() {
  const { email, redirect } = useSearch({ from: "/login" });
  const { verifyLoginOtp, sendLoginOtp } = useAuth();
  const nav = useNavigate();
  const [trustDevice, setTrustDevice] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendInSeconds, setResendInSeconds] = useState(0);
  const [otpAttempt, setOtpAttempt] = useState(0);

  const displayEmail = email?.trim() ?? "";

  useEffect(() => {
    if (!displayEmail) {
      nav({ to: "/login", search: { step: "form", email: undefined, redirect } });
      return;
    }

    let cancelled = false;
    void userLoginOtpResendStatus(displayEmail)
      .then(({ resendInSeconds: seconds }) => {
        if (!cancelled) setResendInSeconds(seconds);
      })
      .catch(() => {
        // ignore
      });

    return () => {
      cancelled = true;
    };
  }, [displayEmail, nav, redirect]);

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
        await verifyLoginOtp(displayEmail, code, trustDevice);
        toast.success("Welcome back");
        nav({ to: redirect });
      } catch (e) {
        toast.error((e as Error).message);
        setOtpAttempt((a) => a + 1);
      } finally {
        setVerifying(false);
      }
    },
    [displayEmail, verifying, verifyLoginOtp, trustDevice, nav, redirect],
  );

  const handleResend = async () => {
    setResending(true);
    try {
      const seconds = await sendLoginOtp(displayEmail);
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
    <AuthOtpShell backTo={{ to: "/login", search: { step: "form", email: undefined, redirect } }}>
      <OtpVerifyPanel
        key={otpAttempt}
        email={displayEmail}
        verifying={verifying}
        loading={resending}
        resendInSeconds={resendInSeconds}
        trustDevice={trustDevice}
        onTrustDeviceChange={setTrustDevice}
        onVerify={handleVerify}
        onResend={handleResend}
      />
    </AuthOtpShell>
  );
}
