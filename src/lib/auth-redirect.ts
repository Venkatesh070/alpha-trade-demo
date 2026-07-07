const DEFAULT_REDIRECT = "/app";

const AUTH_PATH_PREFIXES = ["/login", "/register", "/verify", "/forgot-password", "/reset-password", "/admin/login"];

/** Post-login destination — never send users back into auth routes (prevents redirect loops). */
export function sanitizeAuthRedirect(value: string | undefined, fallback = DEFAULT_REDIRECT): string {
  if (!value?.trim()) return fallback;

  let path = value.trim();
  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      path = new URL(path).pathname + new URL(path).search;
    }
  } catch {
    return fallback;
  }

  const qIndex = path.indexOf("?");
  const pathname = (qIndex === -1 ? path : path.slice(0, qIndex)).replace(/\/+$/, "") || "/";

  if (AUTH_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return fallback;
  }

  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    return fallback;
  }

  return path;
}
