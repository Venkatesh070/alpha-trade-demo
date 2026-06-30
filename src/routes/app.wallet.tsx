import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/wallet")({
  component: WalletPage,
});

const TXNS = [
  { id: "1", type: "Deposit", method: "UPI · GPay", amount: 25000, status: "Completed", date: "Jun 28, 2026" },
  { id: "2", type: "Withdrawal", method: "IMPS · HDFC", amount: -10000, status: "Completed", date: "Jun 24, 2026" },
  { id: "3", type: "Deposit", method: "Credit Card", amount: 50000, status: "Completed", date: "Jun 18, 2026" },
  { id: "4", type: "Deposit", method: "Crypto · USDT", amount: 1000, status: "Pending", date: "Jun 14, 2026" },
];

function WalletPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Wallet</h1>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glossy rounded-2xl p-5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total balance</div>
            <Wallet className="h-5 w-5 text-[color:var(--gold)]" />
          </div>
          <div className="mt-2 font-display text-4xl font-extrabold">₹10,00,000.00</div>
          <div className="mt-1 text-xs text-muted-foreground">Demo funds · re-fillable any time</div>
          <div className="mt-6 flex gap-2">
            <Button asChild className="gold-button hover:gold-button-hover"><Link to="/app/wallet/deposit"><ArrowDownToLine className="mr-2 h-4 w-4" /> Deposit</Link></Button>
            <Button asChild variant="outline"><Link to="/app/wallet/withdraw"><ArrowUpFromLine className="mr-2 h-4 w-4" /> Withdraw</Link></Button>
          </div>
        </div>
        <div className="glossy-soft rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Bonus credit</div>
          <div className="mt-2 font-display text-2xl font-bold">₹2,500</div>
          <p className="mt-1 text-xs text-muted-foreground">Earn more via referrals.</p>
          <Button asChild variant="ghost" className="mt-3 text-[color:var(--gold)]"><Link to="/app/referral">Refer a friend →</Link></Button>
        </div>
      </div>

      <div className="glossy overflow-hidden rounded-2xl">
        <div className="border-b border-border/60 p-4">
          <h2 className="font-display text-lg font-bold">Recent transactions</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Method</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
          </thead>
          <tbody className="font-mono">
            {TXNS.map((t) => (
              <tr key={t.id} className="border-t border-border/60">
                <td className="px-4 py-3 font-sans">{t.type}</td>
                <td className="px-4 py-3 font-sans text-muted-foreground">{t.method}</td>
                <td className={"px-4 py-3 text-right " + (t.amount > 0 ? "text-[color:var(--success)]" : "text-[color:var(--destructive)]")}>
                  {t.amount > 0 ? "+" : ""}₹{Math.abs(t.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-sans">
                  <span className={"rounded px-2 py-0.5 text-xs " + (t.status === "Completed" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-[color:var(--warning)]/15 text-[color:var(--warning)]")}>{t.status}</span>
                </td>
                <td className="px-4 py-3 font-sans text-muted-foreground">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
