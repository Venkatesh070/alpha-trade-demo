export const ADMIN_KEY = "exness-admin-auth";
export const ADMIN_TOKENS_KEY = "exness-admin-auth-tokens";

/** Per-tab storage so admin login in one tab does not affect user sessions in another. */
function adminStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function hasAdminSession(): boolean {
  return !!adminStorage()?.getItem(ADMIN_KEY);
}

export function loadAdminProfile(): unknown | null {
  const raw = adminStorage()?.getItem(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadAdminTokens(): { idToken: string; refreshToken?: string; expiresIn?: string } | null {
  const raw = adminStorage()?.getItem(ADMIN_TOKENS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAdminSession(
  admin: unknown | null,
  tokens: { idToken: string; refreshToken?: string; expiresIn?: string } | null,
): void {
  const storage = adminStorage();
  if (!storage) return;

  if (admin) storage.setItem(ADMIN_KEY, JSON.stringify(admin));
  else storage.removeItem(ADMIN_KEY);

  if (tokens) storage.setItem(ADMIN_TOKENS_KEY, JSON.stringify(tokens));
  else storage.removeItem(ADMIN_TOKENS_KEY);
}

/** Remove legacy cross-tab admin keys from localStorage (one-time cleanup). */
export function clearLegacyAdminLocalStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_KEY);
  localStorage.removeItem(ADMIN_TOKENS_KEY);
}
