import { applyActionCode, sendEmailVerification, type ActionCodeSettings, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

/** Base URL for email verification redirects — must match a Firebase Authorized domain. */
function getVerificationBaseUrl(): string {
  const configured = import.meta.env.VITE_APP_URL as string | undefined;
  if (configured?.trim()) {
    return configured.replace(/\/$/, "");
  }

  // Network IPs (172.x, 192.x) are not Firebase-authorized; always use localhost in dev.
  if (import.meta.env.DEV) {
    return "http://localhost:8080";
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:8080";
}

export function verificationActionCodeSettings(email: string): ActionCodeSettings {
  const base = getVerificationBaseUrl();
  return {
    url: `${base}/verify?email=${encodeURIComponent(email)}`,
    handleCodeInApp: true,
  };
}

export async function sendUserVerificationEmail(user: User): Promise<void> {
  const email = user.email;
  if (!email) {
    throw new Error("No email address on this account.");
  }
  await sendEmailVerification(user, verificationActionCodeSettings(email));
}

export async function applyEmailVerificationFromUrl(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const oobCode = params.get("oobCode");
  const mode = params.get("mode");

  if (!oobCode || mode !== "verifyEmail") {
    return false;
  }

  await applyActionCode(auth, oobCode);

  const email = params.get("email") ?? "";
  const cleanUrl = email
    ? `/verify?email=${encodeURIComponent(email)}`
    : "/verify";
  window.history.replaceState({}, "", cleanUrl);

  return true;
}
