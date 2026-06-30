import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/wallet/withdraw")({
  component: WithdrawPage,
});

function WithdrawPage() {
  const [amount, setAmount] = useState("5000");
  const [account, setAccount] = useState("");
  const [ifsc, setIfsc] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !ifsc) return toast.error("Enter account and IFSC");
    toast.success(`Withdrawal of ₹${Number(amount).toLocaleString()} initiated`);
  };
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Withdraw funds</h1>
      <form onSubmit={submit} className="glossy space-y-5 rounded-2xl p-6">
        <div><Label htmlFor="amt">Amount (₹)</Label><Input id="amt" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="font-mono" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="acc">Bank account number</Label><Input id="acc" value={account} onChange={(e) => setAccount(e.target.value)} /></div>
          <div><Label htmlFor="ifsc">IFSC code</Label><Input id="ifsc" value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} /></div>
        </div>
        <div className="rounded-md border border-border bg-surface p-3 text-xs text-muted-foreground">UPI withdrawals are instant. Bank transfers settle within 1 business day.</div>
        <Button className="gold-button hover:gold-button-hover w-full">Confirm withdrawal</Button>
      </form>
    </div>
  );
}
