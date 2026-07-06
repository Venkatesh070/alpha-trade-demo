import { getAdminAuth } from "@/server/firebase-admin";
import {
  isValidEmail,
  normalizeEmail,
  passwordResetActionCodeSettings,
  verificationActionCodeSettings,
} from "@/server/email-utils";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "@/services/mail.service";

export async function deliverVerificationEmail(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    throw new Error("Invalid email address.");
  }

  const link = await getAdminAuth().generateEmailVerificationLink(
    normalized,
    verificationActionCodeSettings(normalized),
  );
  await sendVerificationEmail(normalized, link);
}

export async function deliverPasswordResetEmail(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    throw new Error("Invalid email address.");
  }

  const link = await getAdminAuth().generatePasswordResetLink(
    normalized,
    passwordResetActionCodeSettings(normalized),
  );
  await sendPasswordResetEmail(normalized, link);
}

export async function deliverWelcomeEmail(email: string, userName: string): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    throw new Error("Invalid email address.");
  }

  await sendWelcomeEmail(normalized, userName);
}
