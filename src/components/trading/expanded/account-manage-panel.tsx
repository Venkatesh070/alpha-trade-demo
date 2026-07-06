import { Link } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Image,
  Lock,
  Scale,
  Scan,
  UserPen,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DepositButton } from "@/components/pricing/price-gate";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useTrading } from "@/hooks/use-trading";
import { useLivePrices } from "@/hooks/use-live-prices";
import { ALL_ASSETS } from "@/data/markets";
import {
  ACCOUNT_LEVERAGE,
  calcAccountMetrics,
  formatInr,
  formatSignedInr,
} from "@/lib/account-metrics";
import { accountIdFromEmail } from "@/lib/account-id";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPE = "Ultra Low Standard";
const PLATFORM = "MT5 Ultra Low Standard";
const LEVERAGE = `1:${ACCOUNT_LEVERAGE}`;

function MetricRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("font-mono text-sm tabular-nums", bold ? "font-bold text-foreground" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

const MENU_ITEMS = [
  { icon: Image, label: "MetaTrader Login Details" },
  { icon: Lock, label: "Change MetaTrader Password" },
  { icon: Scale, label: "Change Leverage", badge: LEVERAGE },
  { icon: UserPen, label: "Change Account Name" },
  { icon: Scan, label: "Set Read-Only MetaTrader Password" },
  { icon: Clock, label: "View Transaction History", to: "/app/history" as const },
] as const;

export function AccountManagePanel({ onClose }: { onClose: () => void }) {
  const { balance } = useWallet();
  const { user } = useAuth();
  const { openPositions, closedTrades } = useTrading();
  const live = useLivePrices(4000);
  const accountId = accountIdFromEmail(user?.email);

  const prices = Object.fromEntries(
    ALL_ASSETS.map((asset) => [asset.symbol, live[asset.symbol]?.price ?? asset.price]),
  );
  const metrics = calcAccountMetrics({
    balance,
    openPositions,
    closedTrades,
    prices,
  });
  const marginLevel =
    metrics.margin > 0 ? `${((metrics.equity / metrics.margin) * 100).toFixed(0)}%` : "—";

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(accountId);
      toast.success("Account ID copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <aside className="flex w-[min(360px,100%)] shrink-0 flex-col border-l border-border/60 bg-background">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="font-display text-lg font-bold text-foreground">Manage</h2>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Close manage panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-xl border border-border/60 bg-surface px-3 py-2.5 text-left text-sm"
        >
          <span className="text-base leading-none">🇮🇳</span>
          <span className="min-w-0 flex-1 truncate font-medium text-foreground">
            {ACCOUNT_TYPE} #{accountId}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>

        <div className="mt-3 flex flex-wrap items-center gap-2">
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

        <div className="mt-4 divide-y divide-border/60 border-t border-border/40">
          <MetricRow label="Equity" value={formatInr(metrics.equity)} bold />
          <MetricRow label="Unrealized P/L" value={formatSignedInr(metrics.unrealizedPnl)} />
          <MetricRow label="Balance" value={formatInr(metrics.balance)} />
          <MetricRow label="Margin" value={formatInr(metrics.margin)} />
          <MetricRow label="Free Margin" value={formatInr(metrics.freeMargin)} />
          <MetricRow label="Margin Level" value={marginLevel} />
          <MetricRow label="Credit" value={formatInr(0)} />
          <MetricRow label="Leverage" value={LEVERAGE} />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            {
              icon: ArrowDownToLine,
              label: "Deposit",
              to: "/app/wallet/deposit" as const,
              iconClassName: "text-foreground",
            },
            {
              icon: ArrowUpFromLine,
              label: "Withdraw",
              to: "/app/wallet/withdraw" as const,
              iconClassName: "text-[color:var(--gold)]",
            },
            {
              icon: ArrowLeftRight,
              label: "Transfer",
              to: "/app/wallet" as const,
              iconClassName: "text-foreground",
            },
          ].map(({ icon: Icon, label, to, iconClassName }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-2 rounded-xl py-2 transition hover:bg-accent/50"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-surface ring-1 ring-border/60">
                <Icon className={cn("h-5 w-5", iconClassName)} />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground">
                {label}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-xl bg-surface ring-1 ring-border/50">
          {MENU_ITEMS.map(({ icon: Icon, label, badge, to }, i) => {
            const inner = (
              <>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm text-foreground">{label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {badge && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {badge}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </>
            );

            return to ? (
              <Link
                key={label}
                to={to}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3.5 transition hover:bg-accent/40",
                  i > 0 && "border-t border-border/40",
                )}
              >
                {inner}
              </Link>
            ) : (
              <button
                key={label}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-accent/40",
                  i > 0 && "border-t border-border/40",
                )}
              >
                {inner}
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-border/60 p-4">
        <DepositButton size="default" className="h-11 w-full text-sm font-semibold" />
      </div>
    </aside>
  );
}
