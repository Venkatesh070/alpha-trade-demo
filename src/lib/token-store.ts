const TOKEN_STORAGE_KEY = "exness_user_tokens";

export interface UserApiTokens {
  accessToken: string;
  refreshToken: string;
}

export function getStoredTokens(): UserApiTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserApiTokens;
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: UserApiTokens): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

export function updateAccessToken(accessToken: string): void {
  const stored = getStoredTokens();
  if (!stored) return;
  saveTokens({ ...stored, accessToken });
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return getStoredTokens()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getStoredTokens()?.refreshToken ?? null;
}
