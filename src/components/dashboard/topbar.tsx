import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Menu, Moon, Search, Sun, User2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { PriceLockInline } from "@/components/pricing/price-gate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppTopbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur-xl">
      <button
        onClick={onMenu}
        className="grid h-9 w-9 place-items-center rounded-md border border-border/60 lg:hidden"
        aria-label="Menu"
      >
        <Menu className="h-4 w-4" />
      </button>
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search markets, orders, news…"
          className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-[color:var(--gold)]/40"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <PriceLockInline className="hidden sm:inline-flex" />
        <button
          onClick={toggle}
          aria-label="Theme"
          className="grid h-9 w-9 place-items-center rounded-md border border-border/60"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link
          to="/app/notifications"
          className="relative grid h-9 w-9 place-items-center rounded-md border border-border/60"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-[color:var(--gold)] text-[10px] font-bold text-[color:var(--primary-foreground)]">
            2
          </span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-border/60 bg-surface px-2 py-1.5 text-sm">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--gold)] text-xs font-bold text-[color:var(--primary-foreground)]">
              {(user?.name?.[0] ?? "U").toUpperCase()}
            </span>
            <span className="hidden md:inline">{user?.name?.split(" ")[0] ?? "Trader"}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => nav({ to: "/app/profile" })}>
              <User2 className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => nav({ to: "/app/settings" })}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                nav({ to: "/" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
