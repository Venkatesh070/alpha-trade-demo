import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { AuthShell, GoogleAuthButton, authInputClass, authLabelClass } from "@/components/auth/auth-shell";
import { EmailVerifyOtpStep } from "@/components/auth/email-verify-otp-step";
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed";
import { useAuth } from "@/hooks/use-auth";
import { useGoogleSignIn } from "@/hooks/use-google-sign-in";
import { cn } from "@/lib/utils";
import { readReferralCode } from "@/lib/referral-db";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  password: z.string().min(6, "Min 6 characters").max(64),
  accept: z.boolean().refine((v) => v, "Please accept the terms"),
});
type FormVals = z.infer<typeof schema>;

export const Route = createFileRoute("/register")({
  validateSearch: (s) => ({
    step:
      (s.step as string) === "form"
        ? ("form" as const)
        : (s.step as string) === "otp"
          ? ("otp" as const)
          : undefined,
    email: typeof s.email === "string" ? s.email : undefined,
    ref: typeof s.ref === "string" && s.ref.trim() ? s.ref.trim() : undefined,
  }),
  head: () => ({ meta: [{ title: "Create an account — Exness India" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { step, ref } = useSearch({ from: "/register" });

  useEffect(() => {
    readReferralCode(ref);
  }, [ref]);

  return (
    <RedirectIfAuthed>
      {step === "otp" ? (
        <RegisterOtpStep />
      ) : step === "form" ? (
        <RegisterForm />
      ) : (
        <AuthGate />
      )}
    </RedirectIfAuthed>
  );
}

function RegisterOtpStep() {
  const { email } = useSearch({ from: "/register" });
  const nav = useNavigate();

  return (
    <EmailVerifyOtpStep
      email={email ?? ""}
      backTo={{ to: "/register", search: { step: "form" } }}
      onVerified={() => nav({ to: "/app" })}
    />
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const nav = useNavigate();
  const { ref } = useSearch({ from: "/register" });
  const refCode = readReferralCode(ref);
  const { handleGoogleSignIn, googleLoading } = useGoogleSignIn({ refCode });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", accept: false },
  });

  const onSubmit = async (vals: FormVals) => {
    setLoading(true);
    try {
      await register(vals.name, vals.email, vals.password, refCode);
      toast.message("Enter the 6-digit code sent to your email");
      nav({ to: "/register", search: { step: "otp", email: vals.email } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell active="signup">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="name" className={authLabelClass}>
            Your full name
          </label>
          <input id="name" autoComplete="name" className={authInputClass} {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="mt-1 text-xs text-[#e5494d]">{form.formState.errors.name.message}</p>
          )}
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
              autoComplete="new-password"
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

        <label className="flex items-start gap-2 text-xs leading-relaxed text-[#141d22]/60">
          <input
            type="checkbox"
            {...form.register("accept")}
            className="mt-0.5 accent-[#ffde02]"
          />
          <span>I confirm I am 18+ and accept the Terms &amp; Risk Disclosure.</span>
        </label>
        {form.formState.errors.accept && (
          <p className="text-xs text-[#e5494d]">{form.formState.errors.accept.message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "mt-1 inline-flex h-11 w-full items-center justify-center rounded",
            "bg-[#ffde02] text-sm font-semibold text-black",
            "transition-colors hover:bg-[#ffe535] active:bg-[#d1b500] disabled:opacity-60",
          )}
        >
          {loading ? "Creating account…" : "Continue"}
        </button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-[#141d22]/10" />
          <span className="text-xs text-[#141d22]/50">Or sign up with</span>
          <span className="h-px flex-1 bg-[#141d22]/10" />
        </div>

        <GoogleAuthButton
          label="Google"
          onClick={handleGoogleSignIn}
          loading={googleLoading}
          disabled={loading}
        />
      </form>
    </AuthShell>
  );
}
