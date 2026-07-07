import {
  applyActionCode,
  sendEmailVerification,
  sendPasswordResetEmail,
  type ActionCodeSettings,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { mapFirebaseAuthError } from "@/lib/firebase-errors";

/** Base URL for email action redirects — must match a Firebase Authorized domain. */
function getVerificationBaseUrl(): string {
  const configured = import.meta.env.VITE_APP_URL as string | undefined;
  if (configured?.trim()) {
    return configured.replace(/\/$/, "");
  }

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

export function passwordResetActionCodeSettings(email: string): ActionCodeSettings {
  const base = getVerificationBaseUrl();
  return {
    url: `${base}/reset-password?email=${encodeURIComponent(email)}`,
    handleCodeInApp: true,
  };
}

export async function sendUserVerificationEmail(user: User): Promise<void> {
  const email = user.email;
  if (!email) {
    throw new Error("No email address on this account.");
  }

  try {
    await sendEmailVerification(user, verificationActionCodeSettings(email));
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
}

export async function sendUserPasswordResetEmail(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    throw new Error("Email is required.");
  }

  try {
    await sendPasswordResetEmail(auth, normalized, passwordResetActionCodeSettings(normalized));
  } catch (err) {
    throw new Error(mapFirebaseAuthError(err));
  }
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
