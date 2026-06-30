import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  password: z.string().min(8, "Min 8 characters").max(64),
  accept: z.boolean().refine((v) => v, "Please accept the terms"),
});
type FormVals = z.infer<typeof schema>;

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Open Demo Account — Exness India" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, sendOtp } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", accept: false },
  });

  const onSubmit = async (vals: FormVals) => {
    setLoading(true);
    try {
      await register(vals.name, vals.email, vals.password);
      await sendOtp(vals.email);
      toast.success("Demo account created");
      nav({ to: "/verify", search: { email: vals.email } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto grid max-w-md gap-6 px-4 py-12">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Open a <span className="gold-text">demo account</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">₹10,00,000 virtual balance · no KYC · instant access.</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="glossy space-y-4 rounded-2xl p-6">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && <p className="mt-1 text-xs text-[color:var(--destructive)]">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email && <p className="mt-1 text-xs text-[color:var(--destructive)]">{form.formState.errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} />
            {form.formState.errors.password && <p className="mt-1 text-xs text-[color:var(--destructive)]">{form.formState.errors.password.message}</p>}
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" {...form.register("accept")} className="mt-0.5 accent-[color:var(--gold)]" />
            <span>I confirm I am 18+ and accept the demo Terms & Risk Disclosure.</span>
          </label>
          {form.formState.errors.accept && <p className="text-xs text-[color:var(--destructive)]">{form.formState.errors.accept.message}</p>}
          <Button disabled={loading} className="gold-button hover:gold-button-hover w-full">
            {loading ? "Creating…" : "Create demo account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already a member? <Link to="/login" className="text-[color:var(--gold)] hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
