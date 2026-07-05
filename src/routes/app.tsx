import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { AppIconSidebar, AppSidebar } from "@/components/dashboard/sidebar";
import { AppTopbar } from "@/components/dashboard/topbar";
import { RequireAuth } from "@/components/auth/require-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isTrading = pathname.startsWith("/app/trading");

  if (isTrading) {
    return (
      <RequireAuth>
        <div className="flex h-screen min-h-0 overflow-hidden bg-background">
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-40 transition-transform lg:static lg:translate-x-0",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <AppIconSidebar
              onNavigate={() => setMobileOpen(false)}
              variant="expanded"
            />
          </div>
          {mobileOpen && (
            <div
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Outlet />
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="flex h-screen min-h-0 bg-background">
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-40 transition-transform lg:static lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <AppSidebar onNavigate={() => setMobileOpen(false)} />
        </div>
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <AppTopbar onMenu={() => setMobileOpen(true)} />
          <main className="relative min-h-0 flex-1 overflow-y-auto bg-surface-2/35 dark:bg-gradient-to-b dark:from-background dark:via-background dark:to-surface/30">
            <Outlet />
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
