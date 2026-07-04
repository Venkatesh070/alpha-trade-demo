import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { type AdminProfile, type AuthTokens, adminLogin, adminMe } from "@/lib/auth-api";
import { auth } from "@/lib/firebase";

interface AdminAuthCtx {
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthCtx | null>(null);
const ADMIN_KEY = "exness-admin-auth";
const ADMIN_TOKENS_KEY = "exness-admin-auth-tokens";

function loadTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_TOKENS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(admin: AdminProfile | null, tokens: AuthTokens | null) {
  if (typeof window === "undefined") return;
  if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  else localStorage.removeItem(ADMIN_KEY);
  if (tokens) localStorage.setItem(ADMIN_TOKENS_KEY, JSON.stringify(tokens));
  else localStorage.removeItem(ADMIN_TOKENS_KEY);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((profile: AdminProfile | null, tokens: AuthTokens | null) => {
    setAdmin(profile);
    saveSession(profile, tokens);
  }, []);

  useEffect(() => {
    async function restore() {
      const tokens = loadTokens();
      if (!tokens?.idToken) {
        setLoading(false);
        return;
      }

      try {
        const { admin: profile } = await adminMe(tokens.idToken);
        setAdmin(profile);
        saveSession(profile, tokens);
      } catch {
        saveSession(null, null);
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

      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch {
        // API login succeeded; Firebase client sync is optional
      }
    },
    [persist],
  );

  const logout = useCallback(() => {
    signOut(auth);
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
