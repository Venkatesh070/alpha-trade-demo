import { getAdminAuth } from "@/server/firebase-admin";
import { normalizeEmail } from "@/server/email-utils";
import { verifyLoginOtp } from "@/server/login-otp";

export async function verifyRegistrationOtp(
  uid: string,
  email: string,
  code: string,
): Promise<void> {
  const normalized = normalizeEmail(email);
  await verifyLoginOtp(normalized, code);

  const adminAuth = getAdminAuth();
  const user = await adminAuth.getUser(uid);

  if (normalizeEmail(user.email ?? "") !== normalized) {
    throw new Error("Email mismatch on this account.");
  }

  if (!user.emailVerified) {
    await adminAuth.updateUser(uid, { emailVerified: true });
  }
}
