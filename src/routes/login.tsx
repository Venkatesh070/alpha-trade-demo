import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { AuthGate } from "@/components/auth/auth-gate";
import { AuthShell, GoogleAuthButton, authInputClass, authLabelClass } from "@/components/auth/auth-shell";
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed";
import { useAuth, getAuthIdToken } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { adminMe } from "@/lib/auth-api";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type FormVals = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  validateSearch: (s) => ({
    redirect: (s.redirect as string) ?? "/app",
    step: (s.step as string) === "form" ? ("form" as const) : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — Exness India" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { step } = useSearch({ from: "/login" });

  return (
    <RedirectIfAuthed>
      {step === "form" ? <LoginForm /> : <AuthGate />}
    </RedirectIfAuthed>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const nav = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (vals: FormVals) => {
    setLoading(true);
    try {
      const verified = await login(vals.email, vals.password);
      if (!verified) {
        const idToken = await getAuthIdToken();
        if (idToken) {
          try {
            const { admin } = await adminMe(idToken);
            if (admin) {
              await signOut(auth);
              toast.message("This is an admin account — use the admin sign-in page");
              nav({ to: "/admin/login" });
              return;
            }
          } catch {
            // not an admin — continue to email verification
          }
        }
        toast.message("Verify your email to continue");
        nav({ to: "/verify", search: { email: vals.email } });
        return;
      }
      toast.success("Welcome back");
      nav({ to: redirect });
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

        <GoogleAuthButton label="Google" />

        <p className="pt-2 text-center">
          <Link to="/forgot-password" className="text-sm text-[#158bf9] hover:underline">
            I forgot my password
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
