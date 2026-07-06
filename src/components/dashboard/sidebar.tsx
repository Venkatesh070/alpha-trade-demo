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
import { depositUnlockText, usePriceAccess } from "@/components/pricing/price-gate";
import { useDepositPrompt } from "@/hooks/use-deposit-prompt";
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

function SidebarNavItem({
  to,
  label,
  icon: Icon,
  exact,
  locked,
  active,
  showLock,
  onNavigate,
  variant,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  locked?: boolean;
  active: boolean;
  showLock: boolean;
  onNavigate?: () => void;
  variant: "full" | "icon";
}) {
  const { openDepositPrompt } = useDepositPrompt();

  const handleLockedClick = () => {
    openDepositPrompt(label);
    onNavigate?.();
  };

  if (variant === "icon") {
    if (showLock) {
      return (
        <button
          type="button"
          title={label}
          onClick={handleLockedClick}
          className={cn(
            "relative grid h-9 w-9 place-items-center rounded-lg transition-colors",
            "text-sidebar-foreground/70 hover:bg-[color:var(--gold)]/6 hover:text-foreground dark:hover:bg-sidebar-accent/60",
          )}
        >
          <Icon className="h-4 w-4" />
          <Lock className="absolute bottom-1 right-1 h-2 w-2 text-[color:var(--gold)]" />
        </button>
      );
    }

    return (
      <Link
        to={to as never}
        title={label}
        onClick={onNavigate}
        className={cn(
          "relative grid h-9 w-9 place-items-center rounded-lg transition-colors",
          active
            ? "border-l-2 border-[color:var(--gold)] bg-[color:var(--gold)]/12 text-[color:var(--gold)]"
            : "text-sidebar-foreground/70 hover:bg-[color:var(--gold)]/6 hover:text-foreground dark:hover:bg-sidebar-accent/60 dark:hover:text-sidebar-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </Link>
    );
  }

  if (showLock) {
    return (
      <button
        type="button"
        onClick={handleLockedClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
          "border-l-2 border-transparent text-sidebar-foreground/70 hover:bg-[color:var(--gold)]/6 hover:text-foreground dark:hover:bg-sidebar-accent/60 dark:hover:text-sidebar-foreground",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <Lock className="h-3.5 w-3.5 shrink-0 text-[color:var(--gold)]/80" />
      </button>
    );
  }

  return (
    <Link
      to={to as never}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "border-l-2 border-[color:var(--gold)] bg-[color:var(--gold)]/12 pl-[10px] font-semibold text-foreground shadow-sm dark:bg-sidebar-accent dark:text-sidebar-foreground dark:shadow-none"
          : "border-l-2 border-transparent text-sidebar-foreground/70 hover:bg-[color:var(--gold)]/6 hover:text-foreground dark:hover:bg-sidebar-accent/60 dark:hover:text-sidebar-foreground",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active && "text-[color:var(--gold-deep)] dark:text-[color:var(--gold)]",
        )}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </Link>
  );
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
      <div className="rounded-xl border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/10 px-3.5 py-3.5 dark:border-[color:var(--gold)]/25 dark:bg-[color:var(--gold)]/5">
        <div className="flex items-center gap-2 text-xs font-medium text-[color:var(--gold-deep)] dark:text-[color:var(--gold)]">
          <Lock className="h-3.5 w-3.5" />
          Markets locked
        </div>
        <p className="mt-2 font-mono text-sm tabular-nums">
          Balance: ₹{balance.toLocaleString()}
        </p>
        {shortfall > 0 && (
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            {depositUnlockText()}
          </p>
        )}
        <Button asChild size="sm" className="gold-button hover:gold-button-hover mt-3 h-8 w-full text-xs">
          <Link to="/app/wallet/deposit">Deposit funds</Link>
        </Button>
      </div>
    </div>
  );
}

function IconSidebarFooter() {
  const { balance } = useWallet();
  const { canViewPrices } = usePriceAccess();

  return (
    <div className="flex shrink-0 flex-col items-center gap-2 border-t border-border/40 py-3">
      <Link
        to="/app/wallet"
        title={canViewPrices ? `Balance: ₹${balance.toLocaleString()}` : "Wallet — deposit to unlock"}
        className="relative grid h-10 w-10 place-items-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-[color:var(--gold)]/6 hover:text-foreground dark:hover:bg-sidebar-accent/60"
      >
        <Wallet className="h-4 w-4" />
        {!canViewPrices && (
          <Lock className="absolute bottom-1.5 right-1.5 h-2 w-2 text-[color:var(--gold)]" />
        )}
      </Link>
      {canViewPrices && (
        <span className="max-w-full truncate px-1 font-mono text-[9px] font-semibold tabular-nums text-muted-foreground">
          ₹{balance >= 1000 ? `${Math.round(balance / 1000)}k` : balance}
        </span>
      )}
    </div>
  );
}

export function AppIconSidebar({
  onNavigate,
  variant = "default",
}: {
  onNavigate?: () => void;
  variant?: "default" | "expanded";
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { canViewPrices } = usePriceAccess();
  const expanded = variant === "expanded";

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground",
        expanded ? "w-14" : "w-14",
      )}
    >
      <div className="flex shrink-0 justify-center border-b border-border/40 py-3">
        <Link to="/" onClick={onNavigate} aria-label="Home">
          <Logo mark size="sm" />
        </Link>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col items-center gap-0.5 overflow-y-auto py-2 scrollbar-thin">
        {ITEMS.map(({ to, label, icon, exact, locked }) => {
          const active = isNavActive(path, to, exact);
          const showLock = Boolean(locked && !canViewPrices);

          return (
            <SidebarNavItem
              key={to}
              to={to}
              label={label}
              icon={icon}
              exact={exact}
              locked={locked}
              active={active}
              showLock={showLock}
              onNavigate={onNavigate}
              variant="icon"
            />
          );
        })}
      </nav>

      {!expanded && <IconSidebarFooter />}
    </aside>
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
          {ITEMS.map(({ to, label, icon, exact, locked }) => {
            const active = isNavActive(path, to, exact);
            const showLock = Boolean(locked && !canViewPrices);

            return (
              <li key={to}>
                <SidebarNavItem
                  to={to}
                  label={label}
                  icon={icon}
                  exact={exact}
                  locked={locked}
                  active={active}
                  showLock={showLock}
                  onNavigate={onNavigate}
                  variant="full"
                />
              </li>
            );
          })}
        </ul>
      </nav>

      <SidebarFooter />
    </aside>
  );
}
