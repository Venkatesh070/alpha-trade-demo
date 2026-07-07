export const VERIFICATION_STORAGE_KEY = "exness-kyc";

export type KycStepId = "identity" | "address" | "pan";

export type KycStepStatus = "pending" | "submitted" | "approved";

export interface KycState {
  steps: Record<KycStepId, KycStepStatus>;
  updatedAt: number;
}

type KycDb = Record<string, KycState>;

export const KYC_STEPS: {
  id: KycStepId;
  title: string;
  desc: string;
}[] = [
  {
    id: "identity",
    title: "Identity verification",
    desc: "Upload Aadhaar or Passport — front and back.",
  },
  {
    id: "address",
    title: "Proof of address",
    desc: "Recent utility bill or bank statement (within 3 months).",
  },
  { id: "pan", title: "PAN card", desc: "Required for tax compliance on live accounts." },
];

export function emptyKycState(): KycState {
  return {
    steps: { identity: "pending", address: "pending", pan: "pending" },
    updatedAt: Date.now(),
  };
}

export function loadKycDb(): KycDb {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(VERIFICATION_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveKycDb(db: KycDb) {
  window.localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("exness-kyc-updated"));
}

export function getKycState(email: string): KycState {
  return loadKycDb()[email] ?? emptyKycState();
}

export function submitKycStep(email: string, stepId: KycStepId): KycState {
  const db = loadKycDb();
  const prev = db[email] ?? emptyKycState();
  const next: KycState = {
    steps: { ...prev.steps, [stepId]: "submitted" },
    updatedAt: Date.now(),
  };
  db[email] = next;
  saveKycDb(db);
  return next;
}

export function kycCompletedCount(state: KycState): number {
  return KYC_STEPS.filter((s) => state.steps[s.id] !== "pending").length;
}

export function kycProgressPercent(state: KycState): number {
  return Math.round((kycCompletedCount(state) / KYC_STEPS.length) * 100);
}

export function isKycFullySubmitted(state: KycState): boolean {
  return KYC_STEPS.every((s) => state.steps[s.id] !== "pending");
}
