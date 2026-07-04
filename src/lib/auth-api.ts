export interface UserProfile {
  id: string;
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

export interface AuthTokens {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

function getApiBase(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured?.trim()) return configured.replace(/\/$/, "");
  // In dev, use relative URLs so Vite proxies /api → localhost:4000
  if (import.meta.env.DEV) return "";
  return "http://localhost:4000";
}

const API_URL = getApiBase();

export class AuthApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

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
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
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

async function request<T>(path: string, idToken: string, options: RequestInit = {}): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, {
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

export async function userRegister(input: {
  name: string;
  email: string;
  password: string;
  country?: string;
}): Promise<{ user: UserProfile; tokens: AuthTokens; message?: string }> {
  return requestPublic("/api/auth/user/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function userResendVerification(idToken: string): Promise<{ message: string }> {
  return request("/api/auth/user/resend-verification", idToken, { method: "POST" });
}

export async function userSync(
  idToken: string,
  input: { name: string; country?: string },
): Promise<{ user: UserProfile }> {
  return request("/api/auth/user/sync", idToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function userVerifyEmail(idToken: string): Promise<{ user: UserProfile }> {
  return request("/api/auth/user/verify-email", idToken, { method: "POST" });
}

export async function userMe(idToken: string): Promise<{ user: UserProfile }> {
  return request("/api/auth/user/me", idToken);
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
  return request("/api/auth/admin/me", idToken);
}
