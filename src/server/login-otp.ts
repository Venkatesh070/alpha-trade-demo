import { createHash, randomInt } from "node:crypto";
import { normalizeEmail } from "@/server/email-utils";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

interface OtpRecord {
  hash: string;
  expiresAt: number;
  resendAvailableAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpRecord>();

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  return String(randomInt(100000, 1000000));
}

export function createLoginOtp(email: string): { code: string; resendInSeconds: number } {
  const key = normalizeEmail(email);
  const existing = otpStore.get(key);
  const now = Date.now();

  if (existing && existing.resendAvailableAt > now) {
    const resendInSeconds = Math.ceil((existing.resendAvailableAt - now) / 1000);
    throw new Error(`Please wait ${resendInSeconds}s before requesting a new code.`);
  }

  const code = generateCode();
  otpStore.set(key, {
    hash: hashCode(code),
    expiresAt: now + OTP_TTL_MS,
    resendAvailableAt: now + RESEND_COOLDOWN_MS,
    attempts: 0,
  });

  return { code, resendInSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000) };
}

export function verifyLoginOtp(email: string, code: string): void {
  const key = normalizeEmail(email);
  const record = otpStore.get(key);
  const now = Date.now();

  if (!record) {
    throw new Error("No verification code found. Request a new one.");
  }

  if (record.expiresAt < now) {
    otpStore.delete(key);
    throw new Error("This code has expired. Request a new one.");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key);
    throw new Error("Too many incorrect attempts. Request a new code.");
  }

  if (record.hash !== hashCode(code.trim())) {
    record.attempts += 1;
    const remaining = MAX_ATTEMPTS - record.attempts;
    throw new Error(
      remaining > 0
        ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
        : "Too many incorrect attempts. Request a new code.",
    );
  }

  otpStore.delete(key);
}

export function getOtpResendSeconds(email: string): number {
  const record = otpStore.get(normalizeEmail(email));
  if (!record) return 0;
  const remaining = record.resendAvailableAt - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
