import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  ensureReferralState,
  getReferralState,
  referralCodeFromUserId,
  referralHistoryRows,
  referralStats,
  type ReferralState,
} from "@/lib/referral-db";

interface ReferralCtx {
  code: string;
  link: string;
  stats: ReturnType<typeof referralStats>;
  history: ReturnType<typeof referralHistoryRows>;
  loading: boolean;
  refresh: () => void;
}

const ReferralContext = createContext<ReferralCtx | null>(null);

function buildLink(code: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/register?ref=${code}`;
  }
  return `https://exness-india.com/register?ref=${code}`;
}

export function ReferralProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<ReferralState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!user?.email || !user.id) {
      setState(null);
      return;
    }
    setState(getReferralState(user.email, user.id));
  }, [user?.email, user?.id]);

  useEffect(() => {
    if (!user?.email || !user.id) {
      setState(null);
      setLoading(false);
      return;
    }
    setState(ensureReferralState(user.email, user.id));
    setLoading(false);
  }, [user?.email, user?.id]);

  const code = user?.id ? referralCodeFromUserId(user.id) : "EXGUEST";
  const link = buildLink(code);

  const value = useMemo<ReferralCtx>(
    () => ({
      code,
      link,
      stats: state ? referralStats(state) : { referrals: 0, active: 0, totalEarned: 0 },
      history: state ? referralHistoryRows(state) : [],
      loading,
      refresh,
    }),
    [code, link, state, loading, refresh],
  );

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
}

export function useReferral() {
  const ctx = useContext(ReferralContext);
  if (!ctx) throw new Error("useReferral must be used within ReferralProvider");
  return ctx;
}
