import { Link } from "@tanstack/react-router";
import { Bell, User2, Wallet } from "lucide-react";
import { AccountDropdown } from "@/components/trading/expanded/account-dropdown";
import { useExpandedTradingActions } from "@/components/trading/expanded/expanded-trading-actions";

export function ExpandedTopBar() {
  const { onOpenManage } = useExpandedTradingActions();

  return (
    <header className="flex h-11 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4">
      <AccountDropdown onOpenManage={onOpenManage} />

      <div className="flex items-center gap-1">
        <Link
          to="/app/notifications"
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Link>
        <Link
          to="/app/wallet"
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Wallet"
        >
          <Wallet className="h-4 w-4" />
        </Link>
        <Link
          to="/app/profile"
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Profile"
        >
          <User2 className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
