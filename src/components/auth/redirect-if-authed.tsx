import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { useAuth } from "@/hooks/use-auth";

export function RedirectIfAuthed({ children, to = "/app" }: { children: ReactNode; to?: string }) {
  const { isAuthenticated, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      nav({ to });
    }
  }, [loading, isAuthenticated, nav, to]);

  if (loading) return <AuthLoading />;
  if (isAuthenticated) return null;
  return children;
}
