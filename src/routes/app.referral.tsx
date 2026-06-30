import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/app/referral")({
  component: ReferralPage,
});

const HISTORY = [
  { name: "Rohit B.",   joined: "Jun 24, 2026", earned: 1250, status: "Active" },
  { name: "Liya C.",    joined: "Jun 18, 2026", earned: 980,  status: "Active" },
  { name: "Mihir D.",   joined: "Jun 12, 2026", earned: 540,  status: "Pending KYC" },
  { name: "Nisha P.",   joined: "Jun 05, 2026", earned: 2100, status: "Active" },
];

function ReferralPage() {
  const { user } = useAuth();
  const code = useMemo(() => "EX" + (user?.id ?? "GUEST").slice(0, 6).toUpperCase(), [user]);
  const link = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${code}` : `https://exness-india.demo/register?ref=${code}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Referral program</h1>
      <p className="text-sm text-muted-foreground">Earn ₹500 + 10% lifetime commission for every friend who funds a live account.</p>

      <div className="glossy rounded-2xl p-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Your link</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="flex-1 truncate rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm">{link}</code>
          <Button onClick={() => { navigator.clipboard?.writeText(link); toast.success("Link copied"); }} className="gold-button hover:gold-button-hover"><Copy className="mr-2 h-4 w-4" /> Copy</Button>
          <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-lg border border-border/60 p-3"><div className="text-muted-foreground">Referrals</div><div className="mt-1 font-display text-xl font-bold">12</div></div>
          <div className="rounded-lg border border-border/60 p-3"><div className="text-muted-foreground">Active</div><div className="mt-1 font-display text-xl font-bold">9</div></div>
          <div className="rounded-lg border border-border/60 p-3"><div className="text-muted-foreground">Earned</div><div className="mt-1 font-display text-xl font-bold gold-text">₹14,820</div></div>
        </div>
      </div>

      <div className="glossy overflow-hidden rounded-2xl">
        <div className="border-b border-border/60 p-4"><h2 className="font-display text-lg font-bold">Commission history</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Friend</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3 text-right">Earned</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody className="font-mono">
            {HISTORY.map((h, i) => (
              <tr key={i} className="border-t border-border/60">
                <td className="px-4 py-3 font-sans">{h.name}</td>
                <td className="px-4 py-3 font-sans text-muted-foreground">{h.joined}</td>
                <td className="px-4 py-3 text-right">₹{h.earned.toLocaleString()}</td>
                <td className="px-4 py-3 font-sans"><span className={"rounded px-2 py-0.5 text-xs " + (h.status === "Active" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-[color:var(--warning)]/15 text-[color:var(--warning)]")}>{h.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
