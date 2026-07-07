import { randomUUID } from "node:crypto";
import { getDatabase } from "@/server/db/client";

const USER_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export interface AppSessionRow {
  id: string;
  session_type: string;
  user_email: string | null;
  admin_email: string | null;
  device_id: string | null;
  otp_verified: number;
  trusted_until: number | null;
  payload_json: string | null;
  created_at: number;
  updated_at: number;
  expires_at: number;
}

export interface UserSessionStatus {
  sessionId: string | null;
  otpRequired: boolean;
  otpVerified: boolean;
  trustedDevice: boolean;
}

function now() {
  return Date.now();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function purgeExpiredSessions(): Promise<void> {
  const db = await getDatabase();
  const ts = now();
  await db.execute("DELETE FROM app_sessions WHERE expires_at < ?", [ts]);
  await db.execute("DELETE FROM login_otp_codes WHERE expires_at < ?", [ts]);
}

export async function getSessionById(id: string): Promise<AppSessionRow | null> {
  const db = await getDatabase();
  const rows = await db.query<AppSessionRow>("SELECT * FROM app_sessions WHERE id = ? LIMIT 1", [id]);
  const row = rows[0];
  if (!row || row.expires_at < now()) return null;
  return row;
}

export async function getTrustedUserSession(
  email: string,
  deviceId: string,
): Promise<AppSessionRow | null> {
  const db = await getDatabase();
  const ts = now();
  const rows = await db.query<AppSessionRow>(
    `SELECT * FROM app_sessions
     WHERE session_type = 'user'
       AND user_email = ?
       AND device_id = ?
       AND trusted_until IS NOT NULL
       AND trusted_until > ?
       AND expires_at > ?
     ORDER BY trusted_until DESC
     LIMIT 1`,
    [normalizeEmail(email), deviceId, ts, ts],
  );
  return rows[0] ?? null;
}

export async function getUserSessionStatus(
  email: string,
  deviceId: string,
  sessionId?: string | null,
): Promise<UserSessionStatus> {
  await purgeExpiredSessions();

  const trusted = await getTrustedUserSession(email, deviceId);
  if (trusted) {
    return {
      sessionId: trusted.id,
      otpRequired: false,
      otpVerified: true,
      trustedDevice: true,
    };
  }

  if (sessionId) {
    const session = await getSessionById(sessionId);
    if (
      session &&
      session.session_type === "user" &&
      session.user_email === normalizeEmail(email) &&
      session.device_id === deviceId
    ) {
      const otpVerified = session.otp_verified === 1;
      return {
        sessionId: session.id,
        otpRequired: !otpVerified,
        otpVerified,
        trustedDevice: false,
      };
    }
  }

  return {
    sessionId: null,
    otpRequired: true,
    otpVerified: false,
    trustedDevice: false,
  };
}

export async function createUserSession(input: {
  email: string;
  deviceId: string;
  otpVerified?: boolean;
  trustDevice?: boolean;
}): Promise<AppSessionRow> {
  const db = await getDatabase();
  const ts = now();
  const id = randomUUID();
  const email = normalizeEmail(input.email);
  const trustedUntil = input.trustDevice ? ts + USER_SESSION_TTL_MS : null;

  await db.execute(
    `INSERT INTO app_sessions (
      id, session_type, user_email, device_id, otp_verified, trusted_until,
      payload_json, created_at, updated_at, expires_at
    ) VALUES (?, 'user', ?, ?, ?, ?, NULL, ?, ?, ?)`,
    [
      id,
      email,
      input.deviceId,
      input.otpVerified ? 1 : 0,
      trustedUntil,
      ts,
      ts,
      ts + USER_SESSION_TTL_MS,
    ],
  );

  const session = await getSessionById(id);
  if (!session) throw new Error("Failed to create user session.");
  return session;
}

export async function upsertUserSessionAfterOtp(input: {
  email: string;
  deviceId: string;
  sessionId?: string | null;
  trustDevice?: boolean;
}): Promise<AppSessionRow> {
  const db = await getDatabase();
  const ts = now();
  const email = normalizeEmail(input.email);
  const trustedUntil = input.trustDevice ? ts + USER_SESSION_TTL_MS : null;

  if (input.sessionId) {
    const existing = await getSessionById(input.sessionId);
    if (
      existing &&
      existing.session_type === "user" &&
      existing.user_email === email &&
      existing.device_id === input.deviceId
    ) {
      await db.execute(
        `UPDATE app_sessions
         SET otp_verified = 1, trusted_until = ?, updated_at = ?, expires_at = ?
         WHERE id = ?`,
        [trustedUntil, ts, ts + USER_SESSION_TTL_MS, existing.id],
      );
      const updated = await getSessionById(existing.id);
      if (!updated) throw new Error("Failed to update user session.");
      return updated;
    }
  }

  return createUserSession({
    email,
    deviceId: input.deviceId,
    otpVerified: true,
    trustDevice: input.trustDevice,
  });
}

export async function deleteUserSessions(email: string, deviceId?: string): Promise<void> {
  const db = await getDatabase();
  const normalized = normalizeEmail(email);
  if (deviceId) {
    await db.execute("DELETE FROM app_sessions WHERE user_email = ? AND device_id = ?", [
      normalized,
      deviceId,
    ]);
    return;
  }
  await db.execute("DELETE FROM app_sessions WHERE user_email = ?", [normalized]);
}

export async function createAdminSession(input: {
  adminEmail: string;
  payload: unknown;
}): Promise<AppSessionRow> {
  const db = await getDatabase();
  const ts = now();
  const id = randomUUID();

  await db.execute(
    `INSERT INTO app_sessions (
      id, session_type, admin_email, otp_verified, payload_json,
      created_at, updated_at, expires_at
    ) VALUES (?, 'admin', ?, 1, ?, ?, ?, ?)`,
    [
      id,
      normalizeEmail(input.adminEmail),
      JSON.stringify(input.payload),
      ts,
      ts,
      ts + ADMIN_SESSION_TTL_MS,
    ],
  );

  const session = await getSessionById(id);
  if (!session) throw new Error("Failed to create admin session.");
  return session;
}

export async function touchAdminSession(id: string, payload: unknown): Promise<void> {
  const db = await getDatabase();
  const ts = now();
  await db.execute(
    `UPDATE app_sessions SET payload_json = ?, updated_at = ?, expires_at = ? WHERE id = ?`,
    [JSON.stringify(payload), ts, ts + ADMIN_SESSION_TTL_MS, id],
  );
}

export async function deleteSessionById(id: string): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM app_sessions WHERE id = ?", [id]);
}
