const TRUSTED_DEVICE_KEY = "exness-trusted-devices";
const OTP_SESSION_KEY = "exness-otp-session";
const TRUST_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface TrustedDevice {
  expiresAt: number;
}

type TrustedDeviceDb = Record<string, TrustedDevice>;

function loadTrusted(): TrustedDeviceDb {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(TRUSTED_DEVICE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveTrusted(db: TrustedDeviceDb) {
  window.localStorage.setItem(TRUSTED_DEVICE_KEY, JSON.stringify(db));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isDeviceTrusted(email: string): boolean {
  const key = normalizeEmail(email);
  const record = loadTrusted()[key];
  if (!record) return false;
  if (record.expiresAt < Date.now()) {
    const db = loadTrusted();
    delete db[key];
    saveTrusted(db);
    return false;
  }
  return true;
}

export function trustDevice(email: string) {
  const key = normalizeEmail(email);
  const db = loadTrusted();
  db[key] = { expiresAt: Date.now() + TRUST_TTL_MS };
  saveTrusted(db);
}

export function clearTrustedDevice(email: string) {
  const key = normalizeEmail(email);
  const db = loadTrusted();
  delete db[key];
  saveTrusted(db);
}

export function markOtpSessionVerified(email: string) {
  const key = normalizeEmail(email);
  sessionStorage.setItem(`${OTP_SESSION_KEY}:${key}`, String(Date.now()));
}

export function isOtpSessionVerified(email: string): boolean {
  const key = normalizeEmail(email);
  return sessionStorage.getItem(`${OTP_SESSION_KEY}:${key}`) !== null;
}

export function clearOtpSession(email: string) {
  const key = normalizeEmail(email);
  sessionStorage.removeItem(`${OTP_SESSION_KEY}:${key}`);
}

export function clearAllOtpSessions() {
  if (typeof window === "undefined") return;
  for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(`${OTP_SESSION_KEY}:`)) {
      sessionStorage.removeItem(key);
    }
  }
}
