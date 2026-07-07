import type { AdminProfile } from "@/lib/auth-api";

const ADMIN_SESSION_KEY = "exness-admin-session";

export interface AdminSessionPayload {
  admin: AdminProfile;
  tokens: { idToken: string; refreshToken?: string; expiresIn?: string };
}

export function saveAdminSession(payload: AdminSessionPayload): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(payload));
}

export function loadAdminSession(): AdminSessionPayload | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminSessionPayload;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

/** One-time migration from legacy browser session keys (best-effort). */
export function clearLegacyBrowserSessionKeys(): void {
  if (typeof window === "undefined") return;

  const otpPrefix = "exness-otp-session:";
  for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(otpPrefix)) {
      sessionStorage.removeItem(key);
    }
  }

  localStorage.removeItem("exness-trusted-devices");
  sessionStorage.removeItem("exness-admin-auth");
  sessionStorage.removeItem("exness-admin-auth-tokens");
  localStorage.removeItem("exness-admin-auth");
  localStorage.removeItem("exness-admin-auth-tokens");
}
