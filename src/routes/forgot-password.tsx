import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Exness India" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    toast.success("Reset link sent. Demo: continue to reset.");
    nav({ to: "/reset-password", search: { email } });
  };
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto grid max-w-md gap-6 px-4 py-16">
        <h1 className="font-display text-3xl font-extrabold">Forgot password</h1>
        <form onSubmit={submit} className="glossy space-y-4 rounded-2xl p-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button disabled={loading} className="gold-button hover:gold-button-hover w-full">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Remembered it? <Link to="/login" className="text-[color:var(--gold)] hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
