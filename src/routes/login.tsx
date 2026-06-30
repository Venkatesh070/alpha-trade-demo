import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type FormVals = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  validateSearch: (s) => ({ redirect: (s.redirect as string) ?? "/app" }),
  head: () => ({ meta: [{ title: "Login — Exness India" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormVals>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (vals: FormVals) => {
    setLoading(true);
    try {
      await login(vals.email, vals.password);
      toast.success("Welcome back");
      nav({ to: redirect });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto grid max-w-md gap-6 px-4 py-16">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back to your demo terminal.</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="glossy space-y-4 rounded-2xl p-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email && <p className="mt-1 text-xs text-[color:var(--destructive)]">{form.formState.errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPw ? "text" : "password"} autoComplete="current-password" {...form.register("password")} />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && <p className="mt-1 text-xs text-[color:var(--destructive)]">{form.formState.errors.password.message}</p>}
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-[color:var(--gold)] hover:underline">Forgot password?</Link>
          </div>
          <Button disabled={loading} className="gold-button hover:gold-button-hover w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/register" className="text-[color:var(--gold)] hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
