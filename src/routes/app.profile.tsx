import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  KeyRound,
  Monitor,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatSessionTime, useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataPanel } from "@/components/dashboard/data-panel";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

function kycLabel(status: string) {
  switch (status) {
    case "approved":
      return "Verified";
    case "under_review":
      return "Under review";
    case "action_required":
      return "Action required";
    case "in_progress":
      return "In progress";
    default:
      return "Not started";
  }
}

function ProfilePage() {
  const { user } = useAuth();
  const {
    accountId,
    memberSince,
    emailVerified,
    kycStatus,
    kycProgress,
    kycApproved,
    balance,
    extras,
    sessions,
    passwordAge,
    saveProfile,
    toggleTwoFa,
  } = useProfile();

  const [name, setName] = useState(user?.name ?? "");
  const [country, setCountry] = useState(user?.country ?? extras.country ?? "India");

  useEffect(() => {
    setName(user?.name ?? "");
    setCountry(user?.country ?? extras.country ?? "India");
  }, [user?.name, user?.country, extras.country]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({ name, country });
    toast.success("Profile updated");
  };

  const twoFaEnabled = extras.twoFA ?? user?.twoFA ?? false;

  return (
    <PageShell
      eyebrow="Account"
      title="Profile"
      description="Manage your personal details, security settings, and active sessions."
      width="md"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Account ID" value={accountId} />
        <StatCard label="Member since" value={memberSince} />
        <StatCard
          label="Email"
          value={emailVerified ? "Verified" : "Pending"}
          accent={emailVerified ? "var(--success)" : "var(--warning)"}
        />
        <StatCard
          label="KYC"
          value={kycLabel(kycStatus)}
          accent={kycApproved ? "var(--success)" : "var(--gold)"}
        />
      </div>

      <DataPanel title="Account overview">
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="glossy-soft rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wallet className="h-4 w-4" />
              Available balance
            </div>
            <p className="mt-2 font-display text-2xl font-bold">
              ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="glossy-soft rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              KYC progress
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{kycProgress}%</p>
            {!kycApproved && (
              <Button asChild variant="link" className="mt-1 h-auto p-0 text-[color:var(--gold)]">
                <Link to="/app/verification">Complete verification →</Link>
              </Button>
            )}
          </div>
        </div>
      </DataPanel>

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
              <Input value={accountId} readOnly className="bg-surface/50 font-mono opacity-80" />
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
            {twoFaEnabled
              ? "Authenticator app is enabled on your account."
              : "Add an authenticator app for an extra layer of security."}
          </p>
          <Button
            onClick={() => {
              toggleTwoFa();
              toast.success(twoFaEnabled ? "2FA disabled" : "2FA enabled");
            }}
            variant="outline"
            className="mt-4"
          >
            {twoFaEnabled ? "Disable 2FA" : "Enable 2FA"}
          </Button>
        </div>
        <div className="glossy-soft rounded-2xl p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--gold)]/10">
            <KeyRound className="h-5 w-5 text-[color:var(--gold)]" />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold">Password</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{passwordAge}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/forgot-password">Change password</Link>
          </Button>
        </div>
      </div>

      <DataPanel
        title="Active sessions"
        description={
          sessions.length
            ? `${sessions.length} device${sessions.length === 1 ? "" : "s"}`
            : "Your current session"
        }
      >
        <ul className="divide-y divide-border/50">
          {(sessions.length
            ? sessions
            : [{ id: "current", label: "This device", lastActiveAt: Date.now(), isCurrent: true }]
          ).map((s) => (
            <li key={s.id} className="flex items-center justify-between px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{s.label}</span>
                {s.isCurrent && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--success)]/10 px-2 py-0.5 text-[10px] font-medium text-[color:var(--success)]">
                    <BadgeCheck className="h-3 w-3" />
                    Current
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs",
                  s.isCurrent ? "font-medium text-[color:var(--success)]" : "text-muted-foreground",
                )}
              >
                {formatSessionTime(s.lastActiveAt)}
              </span>
            </li>
          ))}
        </ul>
      </DataPanel>
    </PageShell>
  );
}
