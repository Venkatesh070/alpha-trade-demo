import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ChevronDown,
  Copy,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";
import { XM_BORDER, XM_CHART_BG, XM_REAL_DOT, XM_TEXT } from "@/lib/xm-trading-tokens";

const ACCOUNT_TYPE = "Ultra Low Standard";
const PLATFORM = "MT5 Ultra Low Standard";
const LEVERAGE = "1:1000";

function demoAccountId(email?: string) {
  if (!email) return "430395642";
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return String(430000000 + (hash % 999999));
}

function MetricRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-sm tabular-nums", bold ? "font-bold text-foreground" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

export function AccountDropdown({
  onOpenManage,
  anchor,
  side = "bottom",
  currency = "inr",
}: {
  onOpenManage: () => void;
  anchor?: ReactNode;
  side?: "top" | "bottom";
  currency?: "inr" | "usd";
}) {
  const [open, setOpen] = useState(false);
  const { balance } = useWallet();
  const { user } = useAuth();
  const accountId = demoAccountId(user?.email);
  const sym = currency === "usd" ? "$" : "₹";
  const formatted = `${sym}${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(accountId);
      toast.success("Account ID copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border py-1 pl-1.5 pr-3 text-sm transition-colors hover:bg-accent"
          style={{ borderColor: XM_BORDER, background: XM_CHART_BG, color: XM_TEXT }}
        >
          <span
            className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: "color-mix(in oklch, var(--success) 15%, transparent)", color: XM_REAL_DOT }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: XM_REAL_DOT }}
            />
            Real
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums">{formatted}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      </PopoverTrigger>

      {anchor && <PopoverAnchor asChild>{anchor}</PopoverAnchor>}

      <PopoverContent
        align="start"
        side={side}
        sideOffset={6}
        className="z-[250] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border-border/60 bg-popover p-0 shadow-xl"
      >
        <div className="flex items-start justify-end p-3 pb-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[color:var(--success)]/40 bg-[color:var(--success)]/10 px-2 py-0.5 text-[11px] font-semibold text-[color:var(--success)]">
              Real
            </span>
            <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {PLATFORM}
            </span>
          </div>

          <h3 className="mt-3 font-display text-xl font-bold text-foreground">{ACCOUNT_TYPE}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="font-mono">#{accountId}</span>
            <button
              type="button"
              onClick={copyId}
              className="grid h-6 w-6 place-items-center rounded hover:bg-accent"
              aria-label="Copy account ID"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-border/60">
            <MetricRow label="Equity" value={formatted} bold />
            <MetricRow label="Unrealized P/L" value={`${sym}0.00`} />
            <MetricRow label="Balance" value={formatted} />
            <MetricRow label="Margin" value={`${sym}0.00`} />
            <MetricRow label="Free Margin" value={formatted} />
            <MetricRow label="Margin Level" value="—" />
            <MetricRow label="Credit" value={`${sym}0.00`} />
            <MetricRow label="Leverage" value={LEVERAGE} />
          </div>

          <div className="mt-5 space-y-2.5">
            <Button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenManage();
              }}
              className="h-11 w-full gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Manage
            </Button>
            <Button type="button" variant="outline" className="h-11 w-full gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Switch Account
            </Button>
            <Link
              to="/app/wallet"
              className="block pt-1 text-center text-sm font-medium text-[color:var(--gold-deep)] hover:underline dark:text-[color:var(--gold)]"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
