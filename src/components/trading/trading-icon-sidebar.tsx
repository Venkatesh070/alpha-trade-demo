import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Briefcase,
  LineChart,
  Users2,
  Trophy,
  LayoutGrid,
  Headphones,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import {
  XM_BORDER,
  XM_ICON,
  XM_ICON_BTN,
  XM_ICON_SIZE,
  XM_ICON_STROKE,
  XM_NAV_W,
  XM_SHELL_BG,
  XM_TEXT,
} from "@/lib/xm-trading-tokens";

const TRADING_NAV = [
  { to: "/app", label: "Home", icon: LayoutDashboard, exact: true as const },
  { to: "/app/trading", label: "Trading", icon: LineChart },
  { to: "/app/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/app/copy-trading", label: "Copy Trading", icon: Users2 },
  { to: "/app/leaderboards", label: "Leaderboards", icon: Trophy },
  { to: "/app/competitions", label: "Competitions", icon: LayoutGrid },
] as const;

/** XM far-left navigation rail — 50px */
export function TradingIconSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside
      className="flex h-full shrink-0 flex-col border-r"
      style={{ width: XM_NAV_W, borderColor: XM_BORDER, background: XM_SHELL_BG }}
    >
      <div
        className="flex shrink-0 justify-center border-b py-3"
        style={{ borderColor: XM_BORDER }}
      >
        <Link to="/" onClick={onNavigate} aria-label="Home">
          <Logo mark size="sm" />
        </Link>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col items-center gap-0.5 overflow-y-auto py-2">
        {TRADING_NAV.map(({ to, label, icon: Icon, ...rest }) => (
          <TradingNavLink
            key={to}
            to={to}
            label={label}
            icon={Icon}
            exact={"exact" in rest ? rest.exact : false}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div
        className="flex shrink-0 flex-col items-center border-t py-3"
        style={{ borderColor: XM_BORDER }}
      >
        <button
          type="button"
          title="Support"
          className="grid place-items-center rounded-md transition-colors hover:bg-accent"
          style={{ width: XM_ICON_BTN, height: XM_ICON_BTN, color: XM_ICON }}
          aria-label="Support"
        >
          <Headphones
            style={{ width: XM_ICON_SIZE, height: XM_ICON_SIZE, strokeWidth: XM_ICON_STROKE }}
          />
        </button>
      </div>
    </aside>
  );
}

function TradingNavLink({
  to,
  label,
  icon: Icon,
  exact,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to as never}
      title={label}
      onClick={onNavigate}
      activeOptions={exact ? { exact: true } : undefined}
      inactiveProps={{
        className: "relative grid place-items-center rounded-md transition-colors hover:bg-accent",
        style: { width: XM_ICON_BTN, height: XM_ICON_BTN, color: XM_ICON },
      }}
      activeProps={{
        className:
          "relative grid place-items-center rounded-md border-l-2 border-gold bg-accent text-foreground",
        style: { width: XM_ICON_BTN, height: XM_ICON_BTN, color: XM_TEXT },
      }}
    >
      <Icon
        style={{ width: XM_ICON_SIZE, height: XM_ICON_SIZE, strokeWidth: XM_ICON_STROKE }}
      />
    </Link>
  );
}
