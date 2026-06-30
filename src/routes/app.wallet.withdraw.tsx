import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/use-wallet";
import { PageShell } from "@/components/dashboard/page-shell";
import { DataPanel } from "@/components/dashboard/data-panel";

export const Route = createFileRoute("/app/wallet/withdraw")({
  component: WithdrawPage,
});

function WithdrawPage() {
  const [amount, setAmount] = useState("5000");
  const [account, setAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const { balance, withdraw } = useWallet();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !ifsc) return toast.error("Enter account and IFSC");
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    if (amt > balance) return toast.error("Insufficient balance");
    withdraw(amt, `IMPS · ${ifsc}`);
    toast.success(`Withdrawal of ₹${amt.toLocaleString()} initiated`);
  };

  return (
    <PageShell
      eyebrow="Funds"
      title="Withdraw funds"
      description={`Available balance: ₹${balance.toLocaleString("en-IN")}`}
      width="md"
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/wallet"><ArrowLeft className="mr-1 h-4 w-4" /> Wallet</Link>
        </Button>
      }
    >
      <form onSubmit={submit}>
        <DataPanel title="Bank transfer" description="Funds typically arrive within 1 business day">
          <div className="space-y-4 p-4 sm:p-5">
            <div className="space-y-2">
              <Label htmlFor="amt">Amount (₹)</Label>
              <Input id="amt" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="font-mono text-lg" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="acc">Bank account number</Label>
                <Input id="acc" value={account} onChange={(e) => setAccount(e.target.value)} className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifsc">IFSC code</Label>
                <Input id="ifsc" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} className="font-mono uppercase" />
              </div>
            </div>
            <p className="rounded-xl border border-border/50 bg-surface/50 p-3 text-xs leading-relaxed text-muted-foreground">
              UPI withdrawals are instant where supported. Bank transfers settle within 1 business day on business days.
            </p>
          </div>
          <div className="border-t border-border/50 px-4 py-4 sm:px-5">
            <Button className="gold-button hover:gold-button-hover w-full sm:w-auto">Confirm withdrawal</Button>
          </div>
        </DataPanel>
      </form>
    </PageShell>
  );
}
