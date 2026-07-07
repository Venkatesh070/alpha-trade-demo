import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type AdminProfile, type AuthTokens, adminLogin, adminMe } from "@/lib/auth-api";
import {
  clearAdminSessionOnServer,
  clearLegacyBrowserSessionKeys,
  loadAdminSessionFromServer,
  saveAdminSessionToServer,
  updateAdminSessionOnServer,
} from "@/lib/session-api";

interface AdminAuthCtx {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback(async (profile: AdminProfile | null, tokens: AuthTokens | null) => {
    setAdmin(profile);
    if (profile && tokens) {
      await saveAdminSessionToServer(profile.email, { admin: profile, tokens });
      return;
    }
    await clearAdminSessionOnServer();
  }, []);

  useEffect(() => {
    clearLegacyBrowserSessionKeys();

    async function restore() {
      try {
        const stored = await loadAdminSessionFromServer();
        if (!stored?.tokens?.idToken) {
          setLoading(false);
          return;
        }

        const { admin: profile } = await adminMe(stored.tokens.idToken);
        setAdmin(profile);
        await updateAdminSessionOnServer({ admin: profile, tokens: stored.tokens });
      } catch {
        await clearAdminSessionOnServer();
      } finally {
        setLoading(false);
      }
    }

    restore();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { admin: profile, tokens } = await adminLogin(email, password);
      await persist(profile, tokens);
    },
    [persist],
  );

  const logout = useCallback(() => {
    void (async () => {
      await clearAdminSessionOnServer();
      setAdmin(null);
    })();
  }, []);

  const value = useMemo<AdminAuthCtx>(
    () => ({
      admin,
      isAuthenticated: !!admin,
      loading,
      login,
      logout,
    }),
    [admin, loading, login, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
