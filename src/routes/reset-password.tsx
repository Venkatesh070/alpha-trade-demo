import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s) => ({ email: (s.email as string) ?? "" }),
  head: () => ({ meta: [{ title: "Set a new password — Exness India" }] }),
  component: ResetPage,
});

function ResetPage() {
  const { email } = useSearch({ from: "/reset-password" });
  const { resetPassword } = useAuth();
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Min 8 characters");
    if (pw !== pw2) return toast.error("Passwords don't match");
    setLoading(true);
    try { await resetPassword(email, pw); toast.success("Password updated"); nav({ to: "/login" }); }
    catch (err) { toast.error((err as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto grid max-w-md gap-6 px-4 py-16">
        <h1 className="font-display text-3xl font-extrabold">Set a new password</h1>
        <form onSubmit={submit} className="glossy space-y-4 rounded-2xl p-6">
          <div>
            <Label>Email</Label>
            <Input value={email} readOnly className="opacity-70" />
          </div>
          <div>
            <Label htmlFor="pw">New password</Label>
            <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="pw2">Confirm password</Label>
            <Input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
          </div>
          <Button disabled={loading} className="gold-button hover:gold-button-hover w-full">
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
