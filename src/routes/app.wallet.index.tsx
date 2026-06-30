import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Gift, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";
import { DataTable, DataTableHead, DataTableRow, Th, Td } from "@/components/dashboard/data-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";

export const Route = createFileRoute("/app/wallet/")({
  component: WalletPage,
});

function WalletPage() {
  const { balance, transactions, refresh } = useWallet();
  useEffect(() => { refresh(); }, [refresh]);

  return (
    <PageShell
      eyebrow="Funds"
      title="Wallet"
      description="Manage your demo balance, deposits, withdrawals, and transaction history."
      width="xl"
      actions={
        <div className="flex gap-2">
          <Button asChild className="gold-button hover:gold-button-hover">
            <Link to="/app/wallet/deposit"><ArrowDownToLine className="mr-2 h-4 w-4" /> Deposit</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/wallet/withdraw"><ArrowUpFromLine className="mr-2 h-4 w-4" /> Withdraw</Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glossy rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Available balance</p>
              <p className="mt-2 font-display text-4xl font-extrabold tracking-tight">
                ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Demo funds · deposit ₹5,000+ to enable trading</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--gold)]/10">
              <Wallet className="h-5 w-5 text-[color:var(--gold)]" />
            </span>
          </div>
        </div>
        <div className="glossy-soft rounded-2xl p-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Bonus credit</p>
          <p className="mt-2 font-display text-2xl font-bold">₹2,500</p>
          <p className="mt-1 text-xs text-muted-foreground">Earn more through referrals.</p>
          <Button asChild variant="ghost" className="mt-4 px-0 text-[color:var(--gold)] hover:bg-transparent hover:underline">
            <Link to="/app/referral"><Gift className="mr-1.5 h-4 w-4" /> Refer a friend</Link>
          </Button>
        </div>
      </div>

      <DataPanel title="Recent transactions" description={transactions.length ? `${transactions.length} records` : undefined} padding={false}>
        {transactions.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No transactions yet"
            description="Fund your account via UPI to start trading."
            action={
              <Button asChild className="gold-button hover:gold-button-hover">
                <Link to="/app/wallet/deposit">Make a deposit</Link>
              </Button>
            }
          />
        ) : (
          <DataTable>
            <DataTableHead>
              <tr>
                <Th>Type</Th>
                <Th>Method</Th>
                <Th>Reference</Th>
                <Th className="text-right">Amount</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </tr>
            </DataTableHead>
            <tbody>
              {transactions.map((t) => (
                <DataTableRow key={t.id}>
                  <Td className="font-sans font-medium">{t.type}</Td>
                  <Td className="font-sans text-muted-foreground">{t.method}</Td>
                  <Td mono className="text-muted-foreground">{t.referenceId ?? "—"}</Td>
                  <Td mono className={"text-right font-medium " + (t.amount > 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>
                    {t.amount > 0 ? "+" : ""}₹{Math.abs(t.amount).toLocaleString()}
                  </Td>
                  <Td>
                    <StatusBadge variant={t.status === "Completed" ? "success" : t.status === "Rejected" ? "danger" : "warning"}>
                      {t.status}
                    </StatusBadge>
                  </Td>
                  <Td className="font-sans text-muted-foreground">{t.date}</Td>
                </DataTableRow>
              ))}
            </tbody>
          </DataTable>
        )}
      </DataPanel>
    </PageShell>
  );
}
