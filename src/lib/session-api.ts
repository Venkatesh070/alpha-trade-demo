import { getDeviceId } from "@/lib/device-id";

export interface UserSessionStatus {
  sessionId: string | null;
  otpRequired: boolean;
  otpVerified: boolean;
  trustedDevice: boolean;
  email?: string;
}

async function parseResponse<T>(res: Response): Promise<T & { error?: string }> {
  try {
    return (await res.json()) as T & { error?: string };
  } catch {
    throw new Error("Unexpected server response.");
  }
}

async function sessionRequest<T>(
  path: string,
  options: RequestInit & { idToken?: string } = {},
): Promise<T> {
  const { idToken, ...fetchOptions } = options;
  const res = await fetch(path, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": getDeviceId(),
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...fetchOptions.headers,
    },
  });

  const data = await parseResponse<T>(res);
  if (!res.ok) {
    throw new Error(data.error ?? "Session request failed.");
  }
  return data;
}

export async function fetchUserSessionStatus(idToken: string): Promise<UserSessionStatus> {
  return sessionRequest<UserSessionStatus>("/api/session/status", {
    method: "GET",
    idToken,
  });
}

export async function completeOtpSession(
  idToken: string,
  trustDevice: boolean,
): Promise<UserSessionStatus> {
  return sessionRequest<UserSessionStatus>("/api/session/complete-otp", {
    method: "POST",
    idToken,
    body: JSON.stringify({ trustDevice }),
  });
}

export async function logoutUserSession(idToken?: string): Promise<void> {
  await sessionRequest<{ message: string }>("/api/session/logout", {
    method: "POST",
    idToken,
  });
}

export interface AdminSessionPayload {
  admin: unknown;
  tokens: { idToken: string; refreshToken?: string; expiresIn?: string };
}

export async function saveAdminSessionToServer(
  adminEmail: string,
  payload: AdminSessionPayload,
): Promise<void> {
  await sessionRequest<{ message: string }>("/api/session/admin", {
    method: "POST",
    body: JSON.stringify({ adminEmail, payload }),
  });
}

export async function loadAdminSessionFromServer(): Promise<AdminSessionPayload | null> {
  try {
    const data = await sessionRequest<{ payload: AdminSessionPayload }>("/api/session/admin", {
      method: "GET",
    });
    return data.payload ?? null;
  } catch {
    return null;
  }
}

export async function updateAdminSessionOnServer(payload: AdminSessionPayload): Promise<void> {
  await sessionRequest<{ message: string }>("/api/session/admin", {
    method: "PUT",
    body: JSON.stringify({ payload }),
  });
}

export async function clearAdminSessionOnServer(): Promise<void> {
  await sessionRequest<{ message: string }>("/api/session/admin", {
    method: "DELETE",
  });
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
