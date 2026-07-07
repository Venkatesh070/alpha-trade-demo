import { randomId } from "@/lib/id";

export const PROFILE_STORAGE_KEY = "exness-profile";

export interface ProfileSession {
  id: string;
  label: string;
  lastActiveAt: number;
  isCurrent: boolean;
}

export interface ProfileExtras {
  country?: string;
  twoFA: boolean;
  passwordChangedAt?: number;
  sessions: ProfileSession[];
  updatedAt: number;
}

type ProfileDb = Record<string, ProfileExtras>;

function emptyExtras(): ProfileExtras {
  return { twoFA: false, sessions: [], updatedAt: Date.now() };
}

function detectSessionLabel(): string {
  if (typeof navigator === "undefined") return "This device";
  const ua = navigator.userAgent;
  let browser = "Browser";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";

  let os = "Desktop";
  if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Windows")) os = "Windows";

  return `${browser} · ${os}`;
}

export function loadProfileDb(): ProfileDb {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PROFILE_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveProfileDb(db: ProfileDb) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("exness-profile-updated"));
}

export function getProfileExtras(email: string): ProfileExtras {
  return loadProfileDb()[email] ?? emptyExtras();
}

export function updateProfileExtras(email: string, patch: Partial<ProfileExtras>): ProfileExtras {
  const db = loadProfileDb();
  const prev = db[email] ?? emptyExtras();
  const next: ProfileExtras = {
    ...prev,
    ...patch,
    sessions: patch.sessions ?? prev.sessions,
    updatedAt: Date.now(),
  };
  db[email] = next;
  saveProfileDb(db);
  return next;
}

export function touchCurrentSession(email: string): ProfileExtras {
  const db = loadProfileDb();
  const prev = db[email] ?? emptyExtras();
  const label = detectSessionLabel();
  const now = Date.now();
  const existing = prev.sessions.find((s) => s.isCurrent);

  const sessions = prev.sessions
    .map((s) => ({ ...s, isCurrent: false }))
    .filter((s) => !(s.isCurrent && s.id !== existing?.id));

  const current: ProfileSession = {
    id: existing?.id ?? randomId(),
    label,
    lastActiveAt: now,
    isCurrent: true,
  };

  const withoutDup = sessions.filter((s) => s.id !== current.id);
  const next: ProfileExtras = {
    ...prev,
    sessions: [current, ...withoutDup].slice(0, 5),
    updatedAt: now,
  };
  db[email] = next;
  saveProfileDb(db);
  return next;
}

export function formatSessionTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return "Active now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function formatMemberSince(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPasswordAge(ts?: number): string {
  if (!ts) return "Not changed yet";
  const days = Math.floor((Date.now() - ts) / 86_400_000);
  if (days < 1) return "Changed today";
  if (days === 1) return "Last changed yesterday";
  return `Last changed ${days} days ago`;
}

export function markPasswordChanged(email: string): ProfileExtras {
  return updateProfileExtras(email, { passwordChangedAt: Date.now() });
}
