import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { markPasswordChanged } from "@/lib/profile-db";

export function getPasswordResetCodeFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") !== "resetPassword") return null;
  return params.get("oobCode");
}

export async function verifyPasswordResetFromUrl(): Promise<{ email: string; oobCode: string } | null> {
  const oobCode = getPasswordResetCodeFromUrl();
  if (!oobCode) return null;

  const email = await verifyPasswordResetCode(auth, oobCode);
  return { email, oobCode };
}

export async function completePasswordReset(
  oobCode: string,
  newPassword: string,
  emailHint?: string,
): Promise<string> {
  await confirmPasswordReset(auth, oobCode, newPassword);
  const email = auth.currentUser?.email ?? emailHint;
  if (email) {
    markPasswordChanged(email);
  }
  return email ?? "";
}

export function cleanPasswordResetUrl(email: string) {
  const cleanUrl = `/reset-password?email=${encodeURIComponent(email)}`;
  window.history.replaceState({}, "", cleanUrl);
}
