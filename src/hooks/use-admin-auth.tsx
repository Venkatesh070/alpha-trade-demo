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
  clearLegacyAdminLocalStorage,
  loadAdminTokens,
  saveAdminSession,
} from "@/lib/admin-session";

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

  const persist = useCallback((profile: AdminProfile | null, tokens: AuthTokens | null) => {
    setAdmin(profile);
    saveAdminSession(profile, tokens);
  }, []);

  useEffect(() => {
    clearLegacyAdminLocalStorage();

    async function restore() {
      const tokens = loadAdminTokens();
      if (!tokens?.idToken) {
        setLoading(false);
        return;
      }

      try {
        const { admin: profile } = await adminMe(tokens.idToken);
        setAdmin(profile);
        saveAdminSession(profile, tokens);
      } catch {
        saveAdminSession(null, null);
      } finally {
        setLoading(false);
      }
    }

    restore();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { admin: profile, tokens } = await adminLogin(email, password);
      persist(profile, tokens);
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

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
