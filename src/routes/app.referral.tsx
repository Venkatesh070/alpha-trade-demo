import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Copy, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReferral } from "@/hooks/use-referral";
import { PageShell } from "@/components/dashboard/page-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataPanel } from "@/components/dashboard/data-panel";
import { DataTable, DataTableHead, DataTableRow, Th, Td } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";

export const Route = createFileRoute("/app/referral")({
  component: ReferralPage,
});

function ReferralPage() {
  const { code, link, stats, history, refresh } = useReferral();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Exness India",
          text: "Trade forex, crypto, and more with Exness India.",
          url: link,
        });
        return;
      } catch {
        // fall through to copy
      }
    }
    await navigator.clipboard?.writeText(link);
    toast.success("Link copied");
  };

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
          <Button variant="outline" className="shrink-0" onClick={share}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </DataPanel>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Referrals" value={String(stats.referrals)} icon={Gift} />
        <StatCard label="Active" value={String(stats.active)} />
        <StatCard
          label="Total earned"
          value={`₹${stats.totalEarned.toLocaleString("en-IN")}`}
          accent="var(--gold)"
        />
      </div>

      <DataPanel title="Commission history" padding={false}>
        {history.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="No referrals yet"
            description="Share your link. You earn ₹500 plus 10% commission when friends fund their account."
          />
        ) : (
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
              {history.map((h) => (
                <DataTableRow key={h.id}>
                  <Td className="font-sans font-medium">{h.name}</Td>
                  <Td className="font-sans text-muted-foreground">{h.joined}</Td>
                  <Td mono className="text-right font-medium">
                    ₹{h.earned.toLocaleString("en-IN")}
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
        )}
      </DataPanel>
    </PageShell>
  );
}
