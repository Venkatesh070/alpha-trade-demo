import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Briefcase, LineChart, Wallet, ListOrdered, History, Bell, Users2, Trophy, Gift, UserCircle, Settings, ShieldCheck, BadgeCheck } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const ITEMS: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/app/trading", label: "Trading", icon: LineChart },
  { to: "/app/wallet", label: "Wallet", icon: Wallet },
  { to: "/app/orders", label: "Orders", icon: ListOrdered },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/copy-trading", label: "Copy Trading", icon: Users2 },
  { to: "/app/leaderboards", label: "Leaderboards", icon: Trophy },
  { to: "/app/competitions", label: "Competitions", icon: BadgeCheck },
  { to: "/app/referral", label: "Referral", icon: Gift },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/verification", label: "Verification", icon: ShieldCheck },
  { to: "/app/profile", label: "Profile", icon: UserCircle },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground">
      <div className="border-b border-border/40 px-5 py-5">
        <Link to="/"><Logo /></Link>
      </div>
      <div className="px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold)]">Terminal</p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
        {ITEMS.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? path === to : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to as never}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground shadow-sm ring-1 ring-[color:var(--gold)]/30"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-[color:var(--gold)]")} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
