import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAuth, type GoogleSignInOutcome } from "@/hooks/use-auth";

export function useGoogleSignIn(options: {
  redirect?: string;
  refCode?: string;
  onSuccess?: () => void;
}) {
  const { signInWithGoogle } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const outcome: GoogleSignInOutcome = await signInWithGoogle(options.refCode);

      if (outcome.type === "admin") {
        toast.message("This is an admin account — use the admin sign-in page");
        nav({ to: "/admin/login" });
        return;
      }

      toast.success(options.refCode ? "Welcome to Exness!" : "Welcome back");
      if (options.onSuccess) {
        options.onSuccess();
      } else {
        nav({ to: options.redirect ?? "/app" });
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle, options.refCode, options.redirect, options.onSuccess, nav]);

  return { handleGoogleSignIn, googleLoading: loading };
}
