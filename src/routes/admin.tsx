import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Newspaper,
  Trophy,
  Gift,
  FileText,
  HelpCircle,
  MessageSquare,
  Image as ImageIcon,
  ShieldCheck,
  Wallet,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { RequireAdminAuth } from "@/components/auth/require-admin-auth";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Exness India" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/deposits", label: "Deposits & Withdrawals", icon: Wallet },
  { to: "/admin/kyc", label: "KYC", icon: ShieldCheck },
  { to: "/admin/markets", label: "Markets", icon: BarChart3 },
  { to: "/admin/news", label: "News", icon: Newspaper },
  { to: "/admin/competitions", label: "Competitions", icon: Trophy },
  { to: "/admin/referrals", label: "Referrals", icon: Gift },
  { to: "/admin/cms", label: "CMS Pages", icon: FileText },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { to: "/admin/media", label: "Media", icon: ImageIcon },
  { to: "/admin/roles", label: "Roles", icon: ShieldCheck },
];

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path === "/admin/login") return <Outlet />;

  return (
    <RequireAdminAuth>
      <AdminShell path={path} />
    </RequireAdminAuth>
  );
}

function AdminShell({ path }: { path: string }) {
  const { admin, logout } = useAdminAuth();
  const nav = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 flex-col border-r border-border/60 bg-sidebar md:flex">
        <div className="px-5 py-5">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className="px-5 pb-3 text-xs uppercase tracking-wider text-[color:var(--gold)]">
          Admin
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? path === to : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to as never}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                  active
                    ? "bg-sidebar-accent ring-gold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-[color:var(--gold)]")} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/60 p-4">
          <p className="truncate text-xs font-medium">{admin?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{admin?.email}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start px-2"
            onClick={() => {
              logout();
              nav({ to: "/admin/login" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
