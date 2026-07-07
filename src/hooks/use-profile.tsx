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
import { useWallet } from "@/hooks/use-wallet";
import { getAccountId } from "@/lib/account-id";
import {
  formatMemberSince,
  formatPasswordAge,
  formatSessionTime,
  getProfileExtras,
  PROFILE_STORAGE_KEY,
  touchCurrentSession,
  updateProfileExtras,
  type ProfileExtras,
  type ProfileSession,
} from "@/lib/profile-db";
import {
  getKycOverallStatus,
  getKycState,
  isKycApproved,
  kycProgressPercent,
  type KycOverallStatus,
} from "@/lib/verification-db";

interface ProfileCtx {
  accountId: string;
  memberSince: string;
  emailVerified: boolean;
  kycStatus: KycOverallStatus;
  kycProgress: number;
  kycApproved: boolean;
  balance: number;
  extras: ProfileExtras;
  sessions: ProfileSession[];
  passwordAge: string;
  saveProfile: (patch: { name?: string; country?: string }) => void;
  toggleTwoFa: () => void;
  refresh: () => void;
}

const ProfileContext = createContext<ProfileCtx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, emailVerified, updateUser } = useAuth();
  const { balance } = useWallet();
  const [extras, setExtras] = useState<ProfileExtras>(() =>
    user?.email ? getProfileExtras(user.email) : { twoFA: false, sessions: [], updatedAt: Date.now() },
  );

  const refresh = useCallback(() => {
    if (!user?.email) return;
    setExtras(getProfileExtras(user.email));
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    setExtras(touchCurrentSession(user.email));
  }, [user?.email]);

  useEffect(() => {
    const onUpdate = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROFILE_STORAGE_KEY) refresh();
    };
    window.addEventListener("exness-profile-updated", onUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("exness-profile-updated", onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const kycState = user?.email ? getKycState(user.email) : null;

  const saveProfile = useCallback(
    (patch: { name?: string; country?: string }) => {
      if (!user?.email) return;
      if (patch.country !== undefined) {
        const next = updateProfileExtras(user.email, { country: patch.country });
        setExtras(next);
        updateUser({ country: patch.country });
      }
      if (patch.name !== undefined) {
        updateUser({ name: patch.name });
      }
    },
    [updateUser, user?.email],
  );

  const toggleTwoFa = useCallback(() => {
    if (!user?.email) return;
    const nextTwoFa = !(extras.twoFA ?? user.twoFA);
    const next = updateProfileExtras(user.email, { twoFA: nextTwoFa });
    setExtras(next);
    updateUser({ twoFA: nextTwoFa });
  }, [extras.twoFA, updateUser, user]);

  const value = useMemo<ProfileCtx>(
    () => ({
      accountId: getAccountId(user),
      memberSince: user?.createdAt ? formatMemberSince(user.createdAt) : "—",
      emailVerified,
      kycStatus: kycState ? getKycOverallStatus(kycState) : "not_started",
      kycProgress: kycState ? kycProgressPercent(kycState) : 0,
      kycApproved: kycState ? isKycApproved(kycState) : false,
      balance,
      extras,
      sessions: extras.sessions,
      passwordAge: formatPasswordAge(extras.passwordChangedAt),
      saveProfile,
      toggleTwoFa,
      refresh,
    }),
    [
      user?.accountId,
      user?.email,
      user?.createdAt,
      emailVerified,
      kycState,
      balance,
      extras,
      saveProfile,
      toggleTwoFa,
      refresh,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

export { formatSessionTime };
