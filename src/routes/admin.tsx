import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, BarChart3, Newspaper, Trophy, Gift, FileText, HelpCircle, MessageSquare, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Exness India" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
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
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 flex-col border-r border-border/60 bg-sidebar md:flex">
        <div className="px-5 py-5"><Link to="/"><Logo /></Link></div>
        <div className="px-5 pb-3 text-xs uppercase tracking-wider text-[color:var(--gold)]">Admin</div>
        <nav className="space-y-0.5 px-3 pb-6">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? path === to : path.startsWith(to);
            return (
              <Link key={to} to={to as never} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm", active ? "bg-sidebar-accent ring-gold" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60")}>
                <Icon className={cn("h-4 w-4", active && "text-[color:var(--gold)]")} />{label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  );
}
