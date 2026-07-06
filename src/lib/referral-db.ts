import { creditWallet } from "@/lib/wallet-db";

export const REFERRAL_STORAGE_KEY = "exness-referrals";
export const REF_SESSION_KEY = "exness-ref-code";
export const REFERRAL_SIGNUP_BONUS = 500;
export const REFERRAL_COMMISSION_RATE = 0.1;

export type ReferralStatus = "Pending KYC" | "Pending" | "Active";

export interface ReferralRecord {
  id: string;
  name: string;
  email: string;
  joinedAt: number;
  earned: number;
  status: ReferralStatus;
  firstDepositAt?: number;
}

export interface ReferralState {
  code: string;
  referrals: ReferralRecord[];
  totalEarned: number;
}

interface ReferralDb {
  byEmail: Record<string, ReferralState>;
  codeIndex: Record<string, string>;
  refereeIndex: Record<string, { referrerEmail: string; referralId: string }>;
}

function emptyReferralState(code: string): ReferralState {
  return { code, referrals: [], totalEarned: 0 };
}

export function referralCodeFromUserId(userId: string): string {
  return `EX${userId.slice(0, 6).toUpperCase()}`;
}

function formatJoinedDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function loadReferralDb(): ReferralDb {
  if (typeof window === "undefined") {
    return { byEmail: {}, codeIndex: {}, refereeIndex: {} };
  }
  try {
    const raw = JSON.parse(window.localStorage.getItem(REFERRAL_STORAGE_KEY) ?? "{}");
    return {
      byEmail: raw.byEmail ?? {},
      codeIndex: raw.codeIndex ?? {},
      refereeIndex: raw.refereeIndex ?? {},
    };
  } catch {
    return { byEmail: {}, codeIndex: {}, refereeIndex: {} };
  }
}

function saveReferralDb(db: ReferralDb) {
  window.localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(db));
}

export function ensureReferralState(email: string, userId: string): ReferralState {
  const db = loadReferralDb();
  const code = referralCodeFromUserId(userId);
  let state = db.byEmail[email];

  if (!state) {
    state = emptyReferralState(code);
    db.byEmail[email] = state;
    db.codeIndex[code] = email;
    saveReferralDb(db);
    return state;
  }

  if (state.code !== code) {
    delete db.codeIndex[state.code];
    state = { ...state, code };
    db.byEmail[email] = state;
    db.codeIndex[code] = email;
    saveReferralDb(db);
  } else if (db.codeIndex[code] !== email) {
    db.codeIndex[code] = email;
    saveReferralDb(db);
  }

  return state;
}

export function getReferralState(email: string, userId: string): ReferralState {
  const db = loadReferralDb();
  return db.byEmail[email] ?? ensureReferralState(email, userId);
}

export function resolveReferrerEmail(code: string): string | undefined {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return undefined;
  return loadReferralDb().codeIndex[normalized];
}

export function recordReferralSignup(
  referrerCode: string,
  referee: { name: string; email: string },
): boolean {
  const referrerEmail = resolveReferrerEmail(referrerCode);
  if (!referrerEmail || referrerEmail === referee.email) return false;

  const db = loadReferralDb();
  const state = db.byEmail[referrerEmail];
  if (!state) return false;

  if (state.referrals.some((r) => r.email === referee.email)) return false;
  if (db.refereeIndex[referee.email]) return false;

  const record: ReferralRecord = {
    id: referee.email,
    name: referee.name,
    email: referee.email,
    joinedAt: Date.now(),
    earned: 0,
    status: "Pending KYC",
  };

  state.referrals.unshift(record);
  db.refereeIndex[referee.email] = { referrerEmail, referralId: record.id };
  saveReferralDb(db);
  return true;
}

export function markReferralVerified(refereeEmail: string) {
  const db = loadReferralDb();
  const link = db.refereeIndex[refereeEmail];
  if (!link) return;

  const state = db.byEmail[link.referrerEmail];
  const record = state?.referrals.find((r) => r.id === link.referralId);
  if (!record || record.status !== "Pending KYC") return;

  record.status = "Pending";
  saveReferralDb(db);
}

export function processReferralDeposit(refereeEmail: string, depositAmount: number): number {
  const db = loadReferralDb();
  const link = db.refereeIndex[refereeEmail];
  if (!link) return 0;

  const state = db.byEmail[link.referrerEmail];
  const record = state?.referrals.find((r) => r.id === link.referralId);
  if (!record) return 0;

  const commission = Math.round(depositAmount * REFERRAL_COMMISSION_RATE);
  const signupBonus = record.firstDepositAt ? 0 : REFERRAL_SIGNUP_BONUS;
  const earned = signupBonus + commission;

  record.earned += earned;
  record.status = "Active";
  if (!record.firstDepositAt) record.firstDepositAt = Date.now();
  state.totalEarned += earned;

  saveReferralDb(db);
  return earned;
}

export function applyReferralDepositReward(refereeEmail: string, depositAmount: number): number {
  const earned = processReferralDeposit(refereeEmail, depositAmount);
  if (earned <= 0) return 0;

  const link = loadReferralDb().refereeIndex[refereeEmail];
  if (link) {
    creditWallet(link.referrerEmail, earned, "Referral bonus");
  }
  return earned;
}

export function stashReferralCode(code: string) {
  if (typeof window === "undefined" || !code.trim()) return;
  window.sessionStorage.setItem(REF_SESSION_KEY, code.trim().toUpperCase());
}

export function readReferralCode(urlRef?: string): string | undefined {
  const fromUrl = urlRef?.trim().toUpperCase();
  if (fromUrl) {
    stashReferralCode(fromUrl);
    return fromUrl;
  }
  if (typeof window === "undefined") return undefined;
  return window.sessionStorage.getItem(REF_SESSION_KEY) ?? undefined;
}

export function clearReferralCode() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(REF_SESSION_KEY);
}

export function referralStats(state: ReferralState) {
  const referrals = state.referrals.length;
  const active = state.referrals.filter((r) => r.status === "Active").length;
  return { referrals, active, totalEarned: state.totalEarned };
}

export function referralHistoryRows(state: ReferralState) {
  return state.referrals.map((r) => ({
    id: r.id,
    name: r.name,
    joined: formatJoinedDate(r.joinedAt),
    earned: r.earned,
    status: r.status,
  }));
}
