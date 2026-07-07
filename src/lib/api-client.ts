import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  updateAccessToken,
  type UserApiTokens,
} from "@/lib/token-store";

function getApiBase(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured?.trim()) return configured.replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return "http://localhost:4000";
}

const API_URL = getApiBase();

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("Session expired. Please sign in again.");
    }

    const res = await fetch(`${API_URL}/api/auth/user/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      accessToken?: string;
      error?: string;
    };

    if (!res.ok || !data.accessToken) {
      clearTokens();
      throw new Error(data.error ?? "Session expired. Please sign in again.");
    }

    updateAccessToken(data.accessToken);
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function authFetch(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<Response> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated.");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (res.status === 401 && retry && getRefreshToken()) {
    await refreshAccessToken();
    return authFetch(path, options, false);
  }

  return res;
}

export async function publicFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export async function logoutApiSession(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;

  try {
    await publicFetch("/api/auth/user/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // still clear local session
  } finally {
    clearTokens();
  }
}

export function persistUserTokens(tokens: UserApiTokens): void {
  saveTokens(tokens);
}

export { refreshAccessToken, getAccessToken, getRefreshToken, clearTokens };
