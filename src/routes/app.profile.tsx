import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, KeyRound, Monitor } from "lucide-react";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [country, setCountry] = useState(user?.country ?? "India");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, country });
    toast.success("Profile updated");
  };

  return (
    <PageShell
      eyebrow="Account"
      title="Profile"
      description="Manage your personal details, security settings, and active sessions."
      width="md"
    >
      <form onSubmit={save}>
        <DataPanel title="Personal information" description="Update your display name and region">
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} readOnly className="bg-surface/50 opacity-80" />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input
                value={user?.id ?? ""}
                readOnly
                className="bg-surface/50 font-mono text-xs opacity-80"
              />
            </div>
          </div>
          <div className="border-t border-border/50 px-4 py-4 sm:px-5">
            <Button type="submit" className="gold-button hover:gold-button-hover">
              Save changes
            </Button>
          </div>
        </DataPanel>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glossy-soft rounded-2xl p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--gold)]/10">
            <ShieldCheck className="h-5 w-5 text-[color:var(--gold)]" />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold">Two-factor authentication</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Add an authenticator app for an extra layer of security.
          </p>
          <Button
            onClick={() => {
              updateUser({ twoFA: !user?.twoFA });
              toast.success(user?.twoFA ? "2FA disabled" : "2FA enabled");
            }}
            variant="outline"
            className="mt-4"
          >
            {user?.twoFA ? "Disable 2FA" : "Enable 2FA"}
          </Button>
        </div>
        <div className="glossy-soft rounded-2xl p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--gold)]/10">
            <KeyRound className="h-5 w-5 text-[color:var(--gold)]" />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold">Password</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Last changed 14 days ago.</p>
          <Button asChild variant="outline" className="mt-4">
            <a href="/forgot-password">Change password</a>
          </Button>
        </div>
      </div>

      <DataPanel title="Active sessions" description="Devices currently signed in">
        <ul className="divide-y divide-border/50">
          {[
            { d: "Chrome · Mumbai", t: "Active now", live: true },
            { d: "iOS · Safari", t: "2h ago", live: false },
            { d: "Edge · Bengaluru", t: "Yesterday", live: false },
          ].map((s) => (
            <li key={s.d} className="flex items-center justify-between px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{s.d}</span>
              </div>
              <span
                className={
                  "text-xs " +
                  (s.live ? "font-medium text-[color:var(--success)]" : "text-muted-foreground")
                }
              >
                {s.t}
              </span>
            </li>
          ))}
        </ul>
      </DataPanel>
    </PageShell>
  );
}
