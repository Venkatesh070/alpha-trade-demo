import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { useAuth } from "@/hooks/use-auth";
import { sanitizeAuthRedirect } from "@/lib/auth-redirect";

function buildReturnTo(pathname: string, search: Record<string, unknown> | undefined): string {
  let path = pathname;
  if (search && Object.keys(search).length > 0) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
      if (value != null && value !== "") params.set(key, String(value));
    }
    const qs = params.toString();
    if (qs) path += `?${qs}`;
  }
  return sanitizeAuthRedirect(path);
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, needsEmailVerification, needsLoginOtp, loading, user } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as Record<string, unknown> | undefined });
  const returnTo = buildReturnTo(pathname, search);

  useEffect(() => {
    if (loading) return;

    if (needsEmailVerification) {
      nav({ to: "/verify", search: { step: "otp", email: user?.email ?? "" } });
      return;
    }

    if (needsLoginOtp) {
      if (pathname.startsWith("/login")) return;
      nav({
        to: "/login",
        search: { step: "otp", email: user?.email ?? "", redirect: returnTo },
      });
      return;
    }

    if (!isAuthenticated) {
      if (pathname.startsWith("/login")) return;
      nav({ to: "/login", search: { redirect: returnTo } });
    }
  }, [loading, isAuthenticated, needsEmailVerification, needsLoginOtp, nav, returnTo, pathname, user?.email]);

  if (loading) return <AuthLoading />;
  if (!isAuthenticated) return null;
  return children;
}
