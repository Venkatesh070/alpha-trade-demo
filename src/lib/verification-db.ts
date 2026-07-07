import { fileToDataUrl } from "@/lib/payments";

export const VERIFICATION_STORAGE_KEY = "exness-kyc-v2";

export type KycStepId = "identity" | "address" | "pan";

export type KycStepStatus = "pending" | "submitted" | "approved" | "rejected";

export type KycOverallStatus =
  | "not_started"
  | "in_progress"
  | "under_review"
  | "approved"
  | "action_required";

export interface KycStepData {
  status: KycStepStatus;
  fileName?: string;
  fileDataUrl?: string;
  submittedAt?: number;
  reviewedAt?: number;
  rejectReason?: string;
}

export interface KycState {
  userName?: string;
  userId?: string;
  steps: Record<KycStepId, KycStepData>;
  updatedAt: number;
}

export interface KycQueueItem {
  email: string;
  userName: string;
  userId?: string;
  state: KycState;
  overallStatus: KycOverallStatus;
  pendingReviewCount: number;
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

function emptyStep(): KycStepData {
  return { status: "pending" };
}

export function emptyKycState(): KycState {
  return {
    steps: { identity: emptyStep(), address: emptyStep(), pan: emptyStep() },
    updatedAt: Date.now(),
  };
}

function normalizeStep(value: unknown): KycStepData {
  if (typeof value === "string") {
    return { status: value as KycStepStatus };
  }
  if (value && typeof value === "object" && "status" in value) {
    const step = value as KycStepData;
    return {
      status: step.status ?? "pending",
      fileName: step.fileName,
      fileDataUrl: step.fileDataUrl,
      submittedAt: step.submittedAt,
      reviewedAt: step.reviewedAt,
      rejectReason: step.rejectReason,
    };
  }
  return emptyStep();
}

function normalizeState(raw: unknown): KycState {
  if (!raw || typeof raw !== "object") return emptyKycState();
  const data = raw as Partial<KycState>;
  const steps = data.steps ?? {};
  return {
    userName: data.userName,
    userId: data.userId,
    steps: {
      identity: normalizeStep(steps.identity),
      address: normalizeStep(steps.address),
      pan: normalizeStep(steps.pan),
    },
    updatedAt: data.updatedAt ?? Date.now(),
  };
}

export function loadKycDb(): KycDb {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(window.localStorage.getItem(VERIFICATION_STORAGE_KEY) ?? "{}");
    const db: KycDb = {};
    for (const [email, state] of Object.entries(raw)) {
      db[email] = normalizeState(state);
    }
    return db;
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

function writeKyc(email: string, state: KycState) {
  const db = loadKycDb();
  db[email] = { ...state, updatedAt: Date.now() };
  saveKycDb(db);
  return db[email];
}

export function kycApprovedCount(state: KycState): number {
  return KYC_STEPS.filter((s) => state.steps[s.id].status === "approved").length;
}

export function kycSubmittedCount(state: KycState): number {
  return KYC_STEPS.filter((s) => state.steps[s.id].status !== "pending").length;
}

export function kycProgressPercent(state: KycState): number {
  return Math.round((kycApprovedCount(state) / KYC_STEPS.length) * 100);
}

export function isKycFullySubmitted(state: KycState): boolean {
  return KYC_STEPS.every((s) => state.steps[s.id].status !== "pending");
}

export function isKycApproved(state: KycState): boolean {
  return KYC_STEPS.every((s) => state.steps[s.id].status === "approved");
}

export function getKycOverallStatus(state: KycState): KycOverallStatus {
  if (isKycApproved(state)) return "approved";
  const statuses = KYC_STEPS.map((s) => state.steps[s.id].status);
  if (statuses.every((s) => s === "pending")) return "not_started";
  if (statuses.some((s) => s === "rejected")) return "action_required";
  if (statuses.some((s) => s === "submitted")) return "under_review";
  if (statuses.some((s) => s === "approved")) return "in_progress";
  return "in_progress";
}

export function pendingKycReviewCount(state: KycState): number {
  return KYC_STEPS.filter((s) => state.steps[s.id].status === "submitted").length;
}

export async function submitKycStep(
  email: string,
  stepId: KycStepId,
  file: File,
  profile?: { userName?: string; userId?: string },
): Promise<KycState> {
  const prev = getKycState(email);
  const current = prev.steps[stepId];
  if (current.status === "submitted" || current.status === "approved") {
    return prev;
  }

  const fileDataUrl = await fileToDataUrl(file);
  const next = writeKyc(email, {
    ...prev,
    userName: profile?.userName ?? prev.userName,
    userId: profile?.userId ?? prev.userId,
    steps: {
      ...prev.steps,
      [stepId]: {
        status: "submitted",
        fileName: file.name,
        fileDataUrl,
        submittedAt: Date.now(),
        reviewedAt: undefined,
        rejectReason: undefined,
      },
    },
  });
  return next;
}

export function approveKycStep(email: string, stepId: KycStepId): KycState {
  const prev = getKycState(email);
  const step = prev.steps[stepId];
  if (step.status !== "submitted") return prev;

  return writeKyc(email, {
    ...prev,
    steps: {
      ...prev.steps,
      [stepId]: {
        ...step,
        status: "approved",
        reviewedAt: Date.now(),
        rejectReason: undefined,
      },
    },
  });
}

export function rejectKycStep(email: string, stepId: KycStepId, reason?: string): KycState {
  const prev = getKycState(email);
  const step = prev.steps[stepId];
  if (step.status !== "submitted") return prev;

  return writeKyc(email, {
    ...prev,
    steps: {
      ...prev.steps,
      [stepId]: {
        ...step,
        status: "rejected",
        reviewedAt: Date.now(),
        rejectReason: reason?.trim() || "Document could not be verified. Please re-upload.",
      },
    },
  });
}

export function approveAllKyc(email: string): KycState {
  const prev = getKycState(email);
  const steps = { ...prev.steps };
  for (const { id } of KYC_STEPS) {
    const step = steps[id];
    if (step.status === "submitted" || step.status === "approved") {
      steps[id] = {
        ...step,
        status: "approved",
        reviewedAt: Date.now(),
        rejectReason: undefined,
      };
    }
  }
  return writeKyc(email, { ...prev, steps });
}

export function rejectAllKyc(email: string, reason?: string): KycState {
  const prev = getKycState(email);
  const steps = { ...prev.steps };
  for (const { id } of KYC_STEPS) {
    const step = steps[id];
    if (step.status === "submitted") {
      steps[id] = {
        ...step,
        status: "rejected",
        reviewedAt: Date.now(),
        rejectReason: reason?.trim() || "KYC could not be verified. Please re-upload your documents.",
      };
    }
  }
  return writeKyc(email, { ...prev, steps });
}

export function listKycQueue(): KycQueueItem[] {
  const db = loadKycDb();
  return Object.entries(db)
    .map(([email, state]) => ({
      email,
      userName: state.userName ?? email.split("@")[0],
      userId: state.userId,
      state,
      overallStatus: getKycOverallStatus(state),
      pendingReviewCount: pendingKycReviewCount(state),
    }))
    .filter((item) => item.pendingReviewCount > 0 || item.overallStatus === "action_required")
    .sort((a, b) => b.state.updatedAt - a.state.updatedAt);
}

export function listAllKycRecords(): KycQueueItem[] {
  const db = loadKycDb();
  return Object.entries(db)
    .map(([email, state]) => ({
      email,
      userName: state.userName ?? email.split("@")[0],
      userId: state.userId,
      state,
      overallStatus: getKycOverallStatus(state),
      pendingReviewCount: pendingKycReviewCount(state),
    }))
    .filter((item) => item.overallStatus !== "not_started")
    .sort((a, b) => b.state.updatedAt - a.state.updatedAt);
}
