import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { randomId } from "@/lib/id";

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  createdAt: number;
  country: string;
  twoFA: boolean;
}

interface AuthCtx {
  user: DemoUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  updateUser: (patch: Partial<DemoUser>) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "exness-auth";

interface Stored { user: DemoUser; password: string }

function loadAll(): Record<string, Stored> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem("exness-users") ?? "{}"); } catch { return {}; }
}
function saveAll(db: Record<string, Stored>) { window.localStorage.setItem("exness-users", JSON.stringify(db)); }

function loadCurrent(): DemoUser | null {
  if (typeof window === "undefined") return null;
  try { const raw = window.localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setUser(loadCurrent()); setLoading(false); }, []);

  const persist = useCallback((u: DemoUser | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const db = loadAll();
    const found = db[email.toLowerCase()];
    if (!found) throw new Error("No account found for that email.");
    if (found.password !== password) throw new Error("Incorrect password.");
    persist(found.user);
  }, [persist]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const db = loadAll();
    const key = email.toLowerCase();
    if (db[key]) throw new Error("An account with that email already exists.");
    const u: DemoUser = {
      id: randomId(),
      email: key,
      name,
      verified: false,
      createdAt: Date.now(),
      country: "India",
      twoFA: false,
    };
    db[key] = { user: u, password };
    saveAll(db);
    persist(u);
  }, [persist]);

  const logout = useCallback(() => persist(null), [persist]);

  const sendOtp = useCallback(async (_email: string) => { await new Promise((r) => setTimeout(r, 400)); }, []);

  const verifyOtp = useCallback(async (email: string, code: string) => {
    await new Promise((r) => setTimeout(r, 350));
    if (code.length !== 6) throw new Error("Enter the 6-digit code.");
    const db = loadAll();
    const key = email.toLowerCase();
    if (db[key]) { db[key].user.verified = true; saveAll(db); if (user?.email === key) persist(db[key].user); }
  }, [persist, user?.email]);

  const resetPassword = useCallback(async (email: string, newPassword: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const db = loadAll();
    const key = email.toLowerCase();
    if (!db[key]) throw new Error("No account with that email.");
    db[key].password = newPassword;
    saveAll(db);
  }, []);

  const updateUser = useCallback((patch: Partial<DemoUser>) => {
    if (!user) return;
    const next = { ...user, ...patch };
    const db = loadAll();
    if (db[user.email]) { db[user.email].user = next; saveAll(db); }
    persist(next);
  }, [persist, user]);

  const value = useMemo<AuthCtx>(() => ({
    user, isAuthenticated: !!user, loading,
    login, register, logout, sendOtp, verifyOtp, resetPassword, updateUser,
  }), [user, loading, login, register, logout, sendOtp, verifyOtp, resetPassword, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
