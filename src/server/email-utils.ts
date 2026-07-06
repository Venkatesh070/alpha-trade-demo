import { loadServerEnv } from "@/server/load-env";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailActionCodeSettings {
  url: string;
  handleCodeInApp: boolean;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length > 0 && trimmed.length <= 254 && EMAIL_REGEX.test(trimmed);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getAppBaseUrl(): string {
  const configured = process.env.APP_URL ?? process.env.VITE_APP_URL;
  if (configured?.trim()) {
    return configured.replace(/\/$/, "");
  }
  return "http://localhost:8080";
}

export function verificationActionCodeSettings(email: string): EmailActionCodeSettings {
  const base = getAppBaseUrl();
  return {
    url: `${base}/verify?email=${encodeURIComponent(email)}`,
    handleCodeInApp: true,
  };
}

export function passwordResetActionCodeSettings(email: string): EmailActionCodeSettings {
  const base = getAppBaseUrl();
  return {
    url: `${base}/reset-password?email=${encodeURIComponent(email)}`,
    handleCodeInApp: true,
  };
}

export async function verifyBearerToken(
  authorization: string | null,
): Promise<{ uid: string; email: string | undefined }> {
  if (!authorization?.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ error: "Missing authorization token." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    throw new Response(JSON.stringify({ error: "Missing authorization token." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  loadServerEnv();

  const { getAdminAuth } = await import("@/server/firebase-admin");
  const decoded = await getAdminAuth().verifyIdToken(token);
  return { uid: decoded.uid, email: decoded.email };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
