import { getSessionById } from "@/server/db/session-store";
import { loadServerEnv } from "@/server/load-env";
import { getAdminSessionIdFromRequest } from "@/server/session-cookies";

export interface AdminRequestContext {
  email: string;
  idToken: string | null;
}

function backendApiBase(): string | null {
  loadServerEnv();
  const configured = process.env.VITE_API_URL?.trim();
  return configured ? configured.replace(/\/$/, "") : null;
}

async function verifyAdminBearer(authorization: string | null): Promise<AdminRequestContext | null> {
  if (!authorization?.startsWith("Bearer ")) return null;

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;

  const base = backendApiBase();
  if (base) {
    try {
      const res = await fetch(`${base}/api/auth/admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { admin?: { email?: string } };
        if (data.admin?.email) {
          return { email: data.admin.email, idToken: token };
        }
      }
    } catch {
      // fall through
    }
  }

  const { getAdminAuth } = await import("@/server/firebase-admin");
  const decoded = await getAdminAuth().verifyIdToken(token);
  if (!decoded.email) return null;
  return { email: decoded.email, idToken: token };
}

export async function requireAdminSession(request: Request): Promise<AdminRequestContext> {
  const sessionId = getAdminSessionIdFromRequest(request);
  if (sessionId) {
    const session = await getSessionById(sessionId);
    if (session?.session_type === "admin" && session.admin_email && session.payload_json) {
      const payload = JSON.parse(session.payload_json) as {
        tokens?: { idToken?: string };
      };
      return {
        email: session.admin_email,
        idToken: payload.tokens?.idToken ?? null,
      };
    }
  }

  const fromBearer = await verifyAdminBearer(request.headers.get("Authorization"));
  if (fromBearer) return fromBearer;

  throw new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export async function proxyAdminRequest(request: Request, path: string): Promise<Response | null> {
  const base = backendApiBase();
  if (!base) return null;

  const admin = await requireAdminSession(request);
  const token = admin.idToken ?? request.headers.get("Authorization")?.slice("Bearer ".length);
  if (!token) return null;

  const incoming = new URL(request.url);
  const target = `${base}${path}${incoming.search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  const contentType = request.headers.get("Content-Type");
  if (contentType) headers["Content-Type"] = contentType;

  try {
    const res = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.text(),
    });

    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (err) {
    console.error("admin proxy fetch failed:", err);
    return null;
  }
}
