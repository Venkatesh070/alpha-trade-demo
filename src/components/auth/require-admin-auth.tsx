import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export function RequireAdminAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      nav({ to: "/admin/login" });
    }
  }, [loading, isAuthenticated, nav]);

  if (loading) return <AuthLoading />;
  if (!isAuthenticated) return null;
  return children;
}
