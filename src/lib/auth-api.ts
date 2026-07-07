import {
  authFetch,
  publicFetch,
  persistUserTokens,
} from "@/lib/api-client";
import { getAccessToken, type UserApiTokens } from "@/lib/token-store";

export interface UserProfile {
  id: string;
  accountId: string;
  email: string;
  name: string;
  verified: boolean;
  createdAt: number;
  country: string;
  twoFA: boolean;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

/** Firebase tokens returned alongside JWT pair after OTP verify. */
export interface AuthTokens {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

export type { UserApiTokens };

export class AuthApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getApiBase(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured?.trim()) return configured.replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return "http://localhost:4000";
}

const API_URL = getApiBase();

async function parseResponse<T>(res: Response): Promise<T & { error?: string }> {
  try {
    return (await res.json()) as T & { error?: string };
  } catch {
    throw new AuthApiError(res.status, "Unexpected server response.");
  }
}

async function requestPublic<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;

  try {
    res = await publicFetch(path, options);
  } catch {
    throw new AuthApiError(0, "Unable to reach the server. Is the API running on port 4000?");
  }

  const data = await parseResponse<T>(res);

  if (!res.ok) {
    throw new AuthApiError(res.status, data.error ?? "Request failed.");
  }

  return data;
}

async function requestWithToken<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    throw new AuthApiError(0, "Unable to reach the server. Is the API running on port 4000?");
  }

  const data = await parseResponse<T>(res);

  if (!res.ok) {
    throw new AuthApiError(res.status, data.error ?? "Request failed.");
  }

  return data;
}

async function requestAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;

  try {
    res = await authFetch(path, options);
  } catch (err) {
    if (err instanceof Error && err.message === "Not authenticated.") {
      throw new AuthApiError(401, err.message);
    }
    throw new AuthApiError(0, "Unable to reach the server. Is the API running on port 4000?");
  }

  const data = await parseResponse<T>(res);

  if (!res.ok) {
    throw new AuthApiError(res.status, data.error ?? "Request failed.");
  }

  return data;
}

type VerifyAuthResponse = {
  user: UserProfile;
  customToken: string;
  tokens: AuthTokens;
  accessToken: string;
  refreshToken: string;
  message?: string;
};

function storeApiTokensFromResponse(data: VerifyAuthResponse): UserApiTokens {
  const apiTokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
  persistUserTokens(apiTokens);
  return apiTokens;
}

/** Firebase-authenticated profile APIs (pass Firebase ID token). */
export async function userSync(
  idToken: string,
  input: { name: string; country?: string },
): Promise<{ user: UserProfile }> {
  return requestWithToken("/api/auth/user/sync", idToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function userVerifyEmail(idToken: string): Promise<{ user: UserProfile }> {
  return requestWithToken("/api/auth/user/verify-email", idToken, { method: "POST" });
}

export async function userMe(idToken: string): Promise<{ user: UserProfile }> {
  return requestWithToken("/api/auth/user/me", idToken);
}

/** JWT-authenticated profile fetch (wallet/dashboard after OTP login). */
export async function userMeJwt(): Promise<{ user: UserProfile }> {
  return requestAuth("/api/auth/user/me");
}

export async function userRegister(input: {
  name: string;
  email: string;
  password: string;
  country?: string;
}): Promise<{ message: string; resendInSeconds: number; emailSent?: boolean }> {
  return requestPublic("/api/auth/user/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function userVerifyRegisterOtp(
  email: string,
  otp: string,
): Promise<VerifyAuthResponse & { apiTokens: UserApiTokens }> {
  const data = await requestPublic<VerifyAuthResponse>("/api/auth/user/verify-register-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  const apiTokens = storeApiTokensFromResponse(data);
  return { ...data, apiTokens };
}

export async function userResendRegisterOtp(
  email: string,
): Promise<{ message: string; resendInSeconds: number }> {
  return requestPublic("/api/auth/user/resend-register-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function userRegisterOtpResendStatus(
  email: string,
): Promise<{ resendInSeconds: number }> {
  return requestPublic(
    `/api/auth/user/register-otp-resend?email=${encodeURIComponent(email)}`,
  );
}

export async function userStartLogin(
  email: string,
  password: string,
): Promise<{ message: string; resendInSeconds: number; emailSent?: boolean }> {
  return requestPublic("/api/auth/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function userVerifyLoginOtp(
  email: string,
  otp: string,
): Promise<VerifyAuthResponse & { apiTokens: UserApiTokens }> {
  const data = await requestPublic<VerifyAuthResponse>("/api/auth/user/verify-login-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  const apiTokens = storeApiTokensFromResponse(data);
  return { ...data, apiTokens };
}

export async function userResendLoginOtp(
  email: string,
): Promise<{ message: string; resendInSeconds: number }> {
  return requestPublic("/api/auth/user/resend-login-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function userLoginOtpResendStatus(email: string): Promise<{ resendInSeconds: number }> {
  return requestPublic(`/api/auth/user/login-otp-resend?email=${encodeURIComponent(email)}`);
}

export async function userRefresh(refreshToken: string): Promise<{ accessToken: string }> {
  return requestPublic("/api/auth/user/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function userLogout(refreshToken: string): Promise<{ message: string }> {
  return requestPublic("/api/auth/user/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ admin: AdminProfile; tokens: AuthTokens }> {
  return requestPublic("/api/auth/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function adminMe(idToken: string): Promise<{ admin: AdminProfile }> {
  return requestWithToken("/api/auth/admin/me", idToken);
}

/** Prefer JWT access token; falls back to Firebase ID token for admin/mail routes. */
export function getApiAccessToken(): string | null {
  return getAccessToken();
}

function apiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured?.trim()) return configured.replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return "http://localhost:4000";
}

async function requestWithIdToken<T>(
  path: string,
  idToken: string,
  options: RequestInit = {},
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${apiBaseUrl()}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        ...options.headers,
      },
    });
  } catch {
    throw new AuthApiError(0, "Unable to reach the server. Is the API running on port 4000?");
  }

  const data = await parseResponse<T>(res);
  if (!res.ok) {
    throw new AuthApiError(res.status, data.error ?? "Request failed.");
  }

  return data;
}

/** Firebase ID-token variants used by OTP/mail session flows before JWT is issued. */
export async function userMeWithIdToken(idToken: string): Promise<{ user: UserProfile }> {
  return requestWithIdToken("/api/auth/user/me", idToken);
}

export async function userSyncWithIdToken(
  idToken: string,
  input: { name: string; country?: string },
): Promise<{ user: UserProfile }> {
  return requestWithIdToken("/api/auth/user/sync", idToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function userVerifyEmail(idToken: string): Promise<{ user: UserProfile }> {
  return requestWithIdToken("/api/auth/user/verify-email", idToken, { method: "POST" });
}
