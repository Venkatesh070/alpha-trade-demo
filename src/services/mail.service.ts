import "@/server/load-env";
import { Resend } from "resend";
import { passwordResetEmailHtml } from "@/services/email-templates/password-reset";
import { verificationEmailHtml } from "@/services/email-templates/verification";
import { welcomeEmailHtml } from "@/services/email-templates/welcome";
import { getAppBaseUrl, isValidEmail, normalizeEmail } from "@/server/email-utils";

const SENDER = "Exness India <noreply@exness-india.com>";

let resendClient: Resend | undefined;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured.");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function assertValidRecipient(to: string): string {
  const email = normalizeEmail(to);
  if (!isValidEmail(email)) {
    throw new Error("Invalid email address.");
  }
  return email;
}

export async function sendVerificationEmail(to: string, verificationLink: string): Promise<void> {
  const email = assertValidRecipient(to);
  if (!verificationLink?.trim()) {
    throw new Error("Verification link is required.");
  }

  const { error } = await getResend().emails.send({
    from: SENDER,
    to: email,
    subject: "Verify your email — Exness India",
    html: verificationEmailHtml(verificationLink),
  });

  if (error) {
    throw new Error(error.message ?? "Failed to send verification email.");
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const email = assertValidRecipient(to);
  if (!resetLink?.trim()) {
    throw new Error("Password reset link is required.");
  }

  const { error } = await getResend().emails.send({
    from: SENDER,
    to: email,
    subject: "Reset your password — Exness India",
    html: passwordResetEmailHtml(resetLink),
  });

  if (error) {
    throw new Error(error.message ?? "Failed to send password reset email.");
  }
}

export async function sendWelcomeEmail(to: string, userName: string): Promise<void> {
  const email = assertValidRecipient(to);
  const appUrl = getAppBaseUrl();

  const { error } = await getResend().emails.send({
    from: SENDER,
    to: email,
    subject: "Welcome to Exness India",
    html: welcomeEmailHtml(userName, `${appUrl}/app`),
  });

  if (error) {
    throw new Error(error.message ?? "Failed to send welcome email.");
  }
}
