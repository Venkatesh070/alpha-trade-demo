import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { useAdminAuth } from "@/hooks/use-admin-auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type FormVals = z.infer<typeof schema>;

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin Login — Exness India" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { isAuthenticated, loading } = useAdminAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      nav({ to: "/admin" });
    }
  }, [loading, isAuthenticated, nav]);

  if (loading) return <AuthLoading />;
  if (isAuthenticated) return null;

  return <AdminLoginForm />;
}

function AdminLoginForm() {
  const { login } = useAdminAuth();
  const nav = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (vals: FormVals) => {
    setSubmitting(true);
    try {
      await login(vals.email, vals.password);
      toast.success("Admin access granted");
      nav({ to: "/admin" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Restricted access for Exness India operators.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="glossy space-y-4 rounded-2xl p-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-[color:var(--destructive)]">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-[color:var(--destructive)]">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          <Button disabled={submitting} className="gold-button hover:gold-button-hover w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/" className="text-[color:var(--gold)] hover:underline">
              Back to site
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
