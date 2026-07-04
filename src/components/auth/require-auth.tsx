import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { useAuth } from "@/hooks/use-auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, needsEmailVerification, loading, user } = useAuth();
  const nav = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    if (loading) return;

    if (needsEmailVerification) {
      nav({ to: "/verify", search: { email: user?.email ?? "" } });
      return;
    }

    if (!isAuthenticated) {
      nav({ to: "/login", search: { redirect: href } });
    }
  }, [loading, isAuthenticated, needsEmailVerification, nav, href, user?.email]);

  if (loading) return <AuthLoading />;
  if (!isAuthenticated) return null;
  return children;
}
