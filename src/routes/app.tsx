import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { AppTopbar } from "@/components/dashboard/topbar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ location }) => {
    // Auth lives in localStorage; on server, optimistically allow,
    // the client AuthProvider will redirect via the layout if needed.
    if (typeof window !== "undefined") {
      const has = !!window.localStorage.getItem("exness-auth");
      if (!has) throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-screen min-h-0 bg-background">
      <div className={cn("fixed inset-y-0 left-0 z-40 transition-transform lg:static lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <AppSidebar onNavigate={() => setMobileOpen(false)} />
      </div>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
