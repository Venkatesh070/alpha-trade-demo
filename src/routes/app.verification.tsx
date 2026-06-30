import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/verification")({
  component: VerificationPage,
});

const STEPS = [
  { id: "identity", title: "Identity", desc: "Upload Aadhaar or Passport." },
  { id: "address",  title: "Address", desc: "Recent utility bill / bank statement." },
  { id: "pan",      title: "PAN", desc: "PAN card image for tax compliance." },
];

function VerificationPage() {
  const [done, setDone] = useState<Set<string>>(new Set());

  const mark = (id: string) => {
    setDone((p) => { const n = new Set(p); n.add(id); return n; });
    toast.success("Document uploaded · review in 1 hour");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <h1 className="font-display text-2xl font-bold">Account verification</h1>
      <p className="text-sm text-muted-foreground">Complete KYC to unlock higher leverage and live trading.</p>
      <div className="space-y-3">
        {STEPS.map((s, i) => (
          <div key={s.id} className={cn("glossy-soft flex items-center gap-4 rounded-2xl p-5", done.has(s.id) && "border-[color:var(--success)]/40")}>
            <div className={cn("grid h-9 w-9 place-items-center rounded-full text-sm font-bold", done.has(s.id) ? "bg-[color:var(--success)] text-[color:var(--success-foreground)]" : "bg-[color:var(--gold)] text-[color:var(--primary-foreground)]")}>
              {done.has(s.id) ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </div>
            <Button onClick={() => mark(s.id)} variant={done.has(s.id) ? "ghost" : "default"} className={done.has(s.id) ? "" : "gold-button hover:gold-button-hover"}>
              <Upload className="mr-2 h-4 w-4" /> {done.has(s.id) ? "Re-upload" : "Upload"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
