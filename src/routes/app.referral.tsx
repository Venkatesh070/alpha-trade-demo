import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { toast } from "sonner";
import { Copy, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataPanel } from "@/components/dashboard/data-panel";
import { DataTable, DataTableHead, DataTableRow, Th, Td } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";

export const Route = createFileRoute("/app/referral")({
  component: ReferralPage,
});

const HISTORY = [
  { name: "Rohit B.", joined: "Jun 24, 2026", earned: 1250, status: "Active" },
  { name: "Liya C.", joined: "Jun 18, 2026", earned: 980, status: "Active" },
  { name: "Mihir D.", joined: "Jun 12, 2026", earned: 540, status: "Pending KYC" },
  { name: "Nisha P.", joined: "Jun 05, 2026", earned: 2100, status: "Active" },
];

function ReferralPage() {
  const { user } = useAuth();
  const code = useMemo(() => "EX" + (user?.id ?? "GUEST").slice(0, 6).toUpperCase(), [user]);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${code}`
      : `https://exness-india.com/register?ref=${code}`;

  return (
    <PageShell
      eyebrow="Rewards"
      title="Referral program"
      description="Earn ₹500 + 10% lifetime commission for every friend who funds a live account."
      width="md"
    >
      <DataPanel title="Your referral link" description={`Code: ${code}`}>
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-xl border border-border/60 bg-surface/60 px-4 py-3 font-mono text-sm">
            {link}
          </code>
          <Button
            onClick={() => {
              navigator.clipboard?.writeText(link);
              toast.success("Link copied");
            }}
            className="gold-button hover:gold-button-hover shrink-0"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
          <Button variant="outline" className="shrink-0">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </DataPanel>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Referrals" value="12" icon={Gift} />
        <StatCard label="Active" value="9" />
        <StatCard label="Total earned" value="₹14,820" accent="var(--gold)" />
      </div>

      <DataPanel title="Commission history" padding={false}>
        <DataTable>
          <DataTableHead>
            <tr>
              <Th>Friend</Th>
              <Th>Joined</Th>
              <Th className="text-right">Earned</Th>
              <Th>Status</Th>
            </tr>
          </DataTableHead>
          <tbody>
            {HISTORY.map((h, i) => (
              <DataTableRow key={i}>
                <Td className="font-sans font-medium">{h.name}</Td>
                <Td className="font-sans text-muted-foreground">{h.joined}</Td>
                <Td mono className="text-right font-medium">
                  ₹{h.earned.toLocaleString()}
                </Td>
                <Td>
                  <StatusBadge variant={h.status === "Active" ? "success" : "warning"}>
                    {h.status}
                  </StatusBadge>
                </Td>
              </DataTableRow>
            ))}
          </tbody>
        </DataTable>
      </DataPanel>
    </PageShell>
  );
}
