import { createHash, randomInt } from "node:crypto";
import { getDatabase } from "@/server/db/client";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

interface OtpRow {
  email: string;
  code_hash: string;
  expires_at: number;
  resend_available_at: number;
  attempts: number;
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  return String(randomInt(100000, 1000000));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createLoginOtp(email: string): Promise<{ code: string; resendInSeconds: number }> {
  const db = await getDatabase();
  const key = normalizeEmail(email);
  const now = Date.now();

  const rows = await db.query<OtpRow>("SELECT * FROM login_otp_codes WHERE email = ? LIMIT 1", [key]);
  const existing = rows[0];

  if (existing && existing.resend_available_at > now) {
    const resendInSeconds = Math.ceil((existing.resend_available_at - now) / 1000);
    throw new Error(`Please wait ${resendInSeconds}s before requesting a new code.`);
  }

  const code = generateCode();
  const params = [key, hashCode(code), now + OTP_TTL_MS, now + RESEND_COOLDOWN_MS];

  if (db.dialect === "mysql") {
    await db.execute(
      `INSERT INTO login_otp_codes (email, code_hash, expires_at, resend_available_at, attempts)
       VALUES (?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         code_hash = VALUES(code_hash),
         expires_at = VALUES(expires_at),
         resend_available_at = VALUES(resend_available_at),
         attempts = 0`,
      params,
    );
  } else {
    await db.execute(
      `INSERT OR REPLACE INTO login_otp_codes (email, code_hash, expires_at, resend_available_at, attempts)
       VALUES (?, ?, ?, ?, 0)`,
      params,
    );
  }

  return { code, resendInSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000) };
}

export async function verifyLoginOtp(email: string, code: string): Promise<void> {
  const db = await getDatabase();
  const key = normalizeEmail(email);
  const now = Date.now();

  const rows = await db.query<OtpRow>("SELECT * FROM login_otp_codes WHERE email = ? LIMIT 1", [key]);
  const record = rows[0];

  if (!record) {
    throw new Error("No verification code found. Request a new one.");
  }

  if (record.expires_at < now) {
    await db.execute("DELETE FROM login_otp_codes WHERE email = ?", [key]);
    throw new Error("This code has expired. Request a new one.");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await db.execute("DELETE FROM login_otp_codes WHERE email = ?", [key]);
    throw new Error("Too many incorrect attempts. Request a new code.");
  }

  if (record.code_hash !== hashCode(code.trim())) {
    const attempts = record.attempts + 1;
    await db.execute("UPDATE login_otp_codes SET attempts = ? WHERE email = ?", [attempts, key]);
    const remaining = MAX_ATTEMPTS - attempts;
    throw new Error(
      remaining > 0
        ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
        : "Too many incorrect attempts. Request a new code.",
    );
  }

  await db.execute("DELETE FROM login_otp_codes WHERE email = ?", [key]);
}

export async function getOtpResendSeconds(email: string): Promise<number> {
  const db = await getDatabase();
  const rows = await db.query<OtpRow>("SELECT * FROM login_otp_codes WHERE email = ? LIMIT 1", [
    normalizeEmail(email),
  ]);
  const record = rows[0];
  if (!record) return 0;
  const remaining = record.resend_available_at - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
