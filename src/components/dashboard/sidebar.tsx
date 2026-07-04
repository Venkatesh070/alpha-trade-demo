import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Briefcase,
  LineChart,
  Wallet,
  ListOrdered,
  History,
  Bell,
  Users2,
  Trophy,
  Gift,
  UserCircle,
  Settings,
  ShieldCheck,
  Medal,
  Lock,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { usePriceAccess } from "@/components/pricing/price-gate";
import { useWallet } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  locked?: boolean;
};

const ITEMS: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/portfolio", label: "Portfolio", icon: Briefcase, locked: true },
  { to: "/app/wallet", label: "Wallet", icon: Wallet },
  { to: "/app/trading", label: "Trading", icon: LineChart, locked: true },
  { to: "/app/orders", label: "Orders", icon: ListOrdered, locked: true },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/copy-trading", label: "Copy Trading", icon: Users2, locked: true },
  { to: "/app/leaderboards", label: "Leaderboards", icon: Trophy, locked: true },
  { to: "/app/competitions", label: "Competitions", icon: Medal, locked: true },
  { to: "/app/referral", label: "Referral", icon: Gift },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/verification", label: "Verification", icon: ShieldCheck },
  { to: "/app/profile", label: "Profile", icon: UserCircle },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function isNavActive(path: string, to: string, exact?: boolean): boolean {
  const p = path.replace(/\/$/, "") || "/";
  const t = to.replace(/\/$/, "") || "/";
  if (exact) return p === t;
  return p === t || p.startsWith(`${t}/`);
}

function SidebarFooter() {
  const { balance } = useWallet();
  const { canViewPrices, minBalance } = usePriceAccess();

  if (canViewPrices) {
    return (
      <div className="shrink-0 border-t border-border/40 px-4 py-4">
        <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Balance
          </p>
          <p className="mt-1 font-mono text-base font-bold tabular-nums">
            ₹{balance.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  const shortfall = Math.max(0, minBalance - balance);

  return (
    <div className="shrink-0 border-t border-border/40 px-4 py-4">
      <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-3.5 py-3.5 dark:border-[color:var(--gold)]/25 dark:bg-[color:var(--gold)]/5">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-[color:var(--gold)]">
          <Lock className="h-3.5 w-3.5" />
          Markets locked
        </div>
        <p className="mt-2 font-mono text-sm tabular-nums">
          ₹{balance.toLocaleString()}
          <span className="text-muted-foreground"> / ₹{minBalance.toLocaleString()}</span>
        </p>
        {shortfall > 0 && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            ₹{shortfall.toLocaleString()} more to unlock
          </p>
        )}
        <Button asChild size="sm" className="gold-button hover:gold-button-hover mt-3 h-8 w-full text-xs">
          <Link to="/app/wallet/deposit">Deposit funds</Link>
        </Button>
      </div>
    </div>
  );
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { canViewPrices } = usePriceAccess();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 border-b border-border/40 px-4 py-4">
        <Link to="/" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {ITEMS.map(({ to, label, icon: Icon, exact, locked }) => {
            const active = isNavActive(path, to, exact);
            const showLock = locked && !canViewPrices;

            return (
              <li key={to}>
                <Link
                  to={to as never}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "border-l-2 border-[color:var(--gold-deep)] bg-sidebar-accent pl-[10px] font-medium text-sidebar-foreground shadow-sm dark:border-[color:var(--gold)] dark:shadow-none"
                          : "border-l-2 border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active && "text-[color:var(--gold-deep)] dark:text-[color:var(--gold)]",
                        )}
                      />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {showLock && (
                    <Lock className="h-3.5 w-3.5 shrink-0 text-[color:var(--gold)]/80" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <SidebarFooter />
    </aside>
  );
}
