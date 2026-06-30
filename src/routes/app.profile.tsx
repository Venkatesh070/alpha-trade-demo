import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, KeyRound, Monitor } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [country, setCountry] = useState(user?.country ?? "India");

  const save = (e: React.FormEvent) => { e.preventDefault(); updateUser({ name, country }); toast.success("Profile updated"); };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Profile</h1>

      <form onSubmit={save} className="glossy space-y-4 rounded-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input value={user?.email ?? ""} readOnly className="opacity-70" /></div>
          <div><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
          <div><Label>Account ID</Label><Input value={user?.id ?? ""} readOnly className="opacity-70 font-mono" /></div>
        </div>
        <Button className="gold-button hover:gold-button-hover">Save changes</Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glossy-soft rounded-2xl p-5">
          <ShieldCheck className="h-6 w-6 text-[color:var(--gold)]" />
          <h2 className="mt-3 font-display text-lg font-bold">Two-Factor Authentication</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add an authenticator app for an extra layer of security.</p>
          <Button onClick={() => { updateUser({ twoFA: !user?.twoFA }); toast.success(user?.twoFA ? "2FA disabled" : "2FA enabled"); }} variant="outline" className="mt-3">{user?.twoFA ? "Disable 2FA" : "Enable 2FA"}</Button>
        </div>
        <div className="glossy-soft rounded-2xl p-5">
          <KeyRound className="h-6 w-6 text-[color:var(--gold)]" />
          <h2 className="mt-3 font-display text-lg font-bold">Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">Last changed 14 days ago.</p>
          <Button asChild variant="outline" className="mt-3"><a href="/forgot-password">Change password</a></Button>
        </div>
      </div>

      <div className="glossy-soft rounded-2xl p-5">
        <Monitor className="h-6 w-6 text-[color:var(--gold)]" />
        <h2 className="mt-3 font-display text-lg font-bold">Active sessions</h2>
        <ul className="mt-3 divide-y divide-border/60 text-sm">
          {[{ d: "Chrome · Mumbai", t: "Active now" }, { d: "iOS · Safari", t: "2h ago" }, { d: "Edge · Bengaluru", t: "Yesterday" }].map((s) => (
            <li key={s.d} className="flex items-center justify-between py-3"><span>{s.d}</span><span className="text-xs text-muted-foreground">{s.t}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
