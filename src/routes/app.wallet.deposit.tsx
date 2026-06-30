import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/wallet/deposit")({
  component: DepositPage,
});

const METHODS = [
  { id: "upi", name: "UPI", desc: "Instant · ₹0 fee" },
  { id: "imps", name: "IMPS / NEFT", desc: "5 min · ₹0 fee" },
  { id: "card", name: "Debit / Credit Card", desc: "Instant · 1.2% fee" },
  { id: "usdt", name: "Crypto · USDT", desc: "10 min · network fee" },
];

function DepositPage() {
  const [method, setMethod] = useState("upi");
  const [amount, setAmount] = useState("10000");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Demo deposit of ₹${Number(amount).toLocaleString()} via ${METHODS.find(m => m.id === method)?.name}`);
  };
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Deposit funds</h1>
      <form onSubmit={submit} className="glossy space-y-5 rounded-2xl p-6">
        <div>
          <Label>Method</Label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {METHODS.map((m) => (
              <button key={m.id} type="button" onClick={() => setMethod(m.id)} className={cn("rounded-lg border p-3 text-left transition-colors", method === m.id ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10" : "border-border bg-surface hover:bg-accent")}>
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="amt">Amount (₹)</Label>
          <Input id="amt" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="font-mono" />
          <div className="mt-2 flex gap-2 text-xs">
            {[1000, 5000, 10000, 25000, 50000].map((v) => (
              <button key={v} type="button" onClick={() => setAmount(String(v))} className="rounded border border-border bg-surface px-2 py-1 hover:bg-accent">₹{v.toLocaleString()}</button>
            ))}
          </div>
        </div>
        <Button className="gold-button hover:gold-button-hover w-full">Confirm deposit</Button>
      </form>
    </div>
  );
}
