const USER_SESSION_COOKIE = "exness_sid";
const ADMIN_SESSION_COOKIE = "exness_admin_sid";
const DEVICE_ID_HEADER = "x-device-id";

const THIRTY_DAYS_SEC = 30 * 24 * 60 * 60;
const EIGHT_HOURS_SEC = 8 * 60 * 60;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function cookieBase() {
  return `Path=/; HttpOnly; SameSite=Lax${isProduction() ? "; Secure" : ""}`;
}

export function getDeviceIdFromRequest(request: Request): string | null {
  const header = request.headers.get(DEVICE_ID_HEADER)?.trim();
  return header && header.length <= 64 ? header : null;
}

export function getUserSessionIdFromRequest(request: Request): string | null {
  return getCookieValue(request, USER_SESSION_COOKIE);
}

export function getAdminSessionIdFromRequest(request: Request): string | null {
  return getCookieValue(request, ADMIN_SESSION_COOKIE);
}

function getCookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  const parts = cookie.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

export function setUserSessionCookie(sessionId: string): string {
  return `${USER_SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Max-Age=${THIRTY_DAYS_SEC}; ${cookieBase()}`;
}

export function setAdminSessionCookie(sessionId: string): string {
  return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Max-Age=${EIGHT_HOURS_SEC}; ${cookieBase()}`;
}

export function clearUserSessionCookie(): string {
  return `${USER_SESSION_COOKIE}=; Max-Age=0; ${cookieBase()}`;
}

export function clearAdminSessionCookie(): string {
  return `${ADMIN_SESSION_COOKIE}=; Max-Age=0; ${cookieBase()}`;
}

export function withSessionCookie(response: Response, cookie: string): Response {
  const headers = new Headers(response.headers);
  headers.append("Set-Cookie", cookie);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
