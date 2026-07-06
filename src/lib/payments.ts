import { creditWallet, updateWallet, type WalletTxn } from "@/lib/wallet-db";
import { applyReferralDepositReward } from "@/lib/referral-db";
import { randomId } from "@/lib/id";

const SETTINGS_KEY = "exness-payment-settings";
const REQUESTS_KEY = "exness-deposit-requests";

export interface PaymentSettings {
  qrImage: string | null;
  upiId: string;
  accountName: string;
  updatedAt: number;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  referenceId: string;
  screenshot: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  reviewedAt?: number;
}

const DEFAULT_QR_PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect fill="#ffffff" width="240" height="240"/>
      <rect x="20" y="20" width="60" height="60" fill="#0F1A15"/>
      <rect x="30" y="30" width="40" height="40" fill="#ffffff"/>
      <rect x="40" y="40" width="20" height="20" fill="#0F1A15"/>
      <rect x="160" y="20" width="60" height="60" fill="#0F1A15"/>
      <rect x="170" y="30" width="40" height="40" fill="#ffffff"/>
      <rect x="180" y="40" width="20" height="20" fill="#0F1A15"/>
      <rect x="20" y="160" width="60" height="60" fill="#0F1A15"/>
      <rect x="30" y="170" width="40" height="40" fill="#ffffff"/>
      <rect x="40" y="180" width="20" height="20" fill="#0F1A15"/>
      <g fill="#0F1A15">
        <rect x="100" y="30" width="10" height="10"/><rect x="120" y="30" width="10" height="10"/><rect x="140" y="30" width="10" height="10"/>
        <rect x="100" y="50" width="10" height="10"/><rect x="130" y="50" width="10" height="10"/>
        <rect x="100" y="100" width="10" height="10"/><rect x="120" y="100" width="10" height="10"/><rect x="140" y="100" width="10" height="10"/>
        <rect x="160" y="100" width="10" height="10"/><rect x="180" y="100" width="10" height="10"/><rect x="200" y="100" width="10" height="10"/>
        <rect x="100" y="120" width="10" height="10"/><rect x="140" y="120" width="10" height="10"/><rect x="180" y="120" width="10" height="10"/>
        <rect x="100" y="160" width="10" height="10"/><rect x="120" y="160" width="10" height="10"/><rect x="140" y="160" width="10" height="10"/>
        <rect x="160" y="160" width="10" height="10"/><rect x="200" y="160" width="10" height="10"/>
        <rect x="100" y="180" width="10" height="10"/><rect x="130" y="180" width="10" height="10"/><rect x="170" y="180" width="10" height="10"/>
        <rect x="100" y="200" width="10" height="10"/><rect x="140" y="200" width="10" height="10"/><rect x="180" y="200" width="10" height="10"/>
      </g>
      <text x="120" y="235" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#666">Scan to pay · UPI</text>
    </svg>`,
  );

const DEFAULT_SETTINGS: PaymentSettings = {
  qrImage: DEFAULT_QR_PLACEHOLDER,
  upiId: "exness-india@upi",
  accountName: "Exness India",
  updatedAt: 0,
};

export function getPaymentSettings(): PaymentSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const stored = JSON.parse(raw) as Partial<PaymentSettings>;
    return {
      qrImage: stored.qrImage ?? DEFAULT_SETTINGS.qrImage,
      upiId: stored.upiId || DEFAULT_SETTINGS.upiId,
      accountName: stored.accountName || DEFAULT_SETTINGS.accountName,
      updatedAt: stored.updatedAt ?? 0,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function savePaymentSettings(patch: Partial<PaymentSettings>) {
  const next = { ...getPaymentSettings(), ...patch, updatedAt: Date.now() };
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

export function getDepositRequests(): DepositRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REQUESTS_KEY);
    const list: DepositRequest[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

function saveDepositRequests(requests: DepositRequest[]) {
  window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

export function addDepositRequest(input: Omit<DepositRequest, "id" | "status" | "createdAt">) {
  const request: DepositRequest = {
    ...input,
    id: randomId(),
    status: "pending",
    createdAt: Date.now(),
  };

  const txn: WalletTxn = {
    id: `txn-${Date.now()}`,
    type: "Deposit",
    method: "UPI · QR",
    amount: input.amount,
    status: "Pending",
    date: new Date().toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    referenceId: input.referenceId,
    depositRequestId: request.id,
  };

  updateWallet(input.userEmail, (prev) => ({
    ...prev,
    transactions: [txn, ...prev.transactions],
  }));

  const requests = getDepositRequests();
  requests.unshift(request);
  saveDepositRequests(requests);
  return request;
}

export function approveDepositRequest(requestId: string) {
  const requests = getDepositRequests();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;
  const req = requests[idx];
  if (req.status !== "pending") return null;

  requests[idx] = { ...req, status: "approved", reviewedAt: Date.now() };
  saveDepositRequests(requests);

  creditWallet(req.userEmail, req.amount, "UPI · QR", {
    depositRequestId: req.id,
    referenceId: req.referenceId,
  });
  applyReferralDepositReward(req.userEmail, req.amount);

  return requests[idx];
}

export function rejectDepositRequest(requestId: string) {
  const requests = getDepositRequests();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;
  const req = requests[idx];
  if (req.status !== "pending") return null;

  requests[idx] = { ...req, status: "rejected", reviewedAt: Date.now() };
  saveDepositRequests(requests);

  updateWallet(req.userEmail, (prev) => ({
    ...prev,
    transactions: prev.transactions.map((t) =>
      t.depositRequestId === requestId ? { ...t, status: "Rejected" as const } : t,
    ),
  }));

  return requests[idx];
}

export async function fileToDataUrl(file: File, maxBytes = 2 * 1024 * 1024): Promise<string> {
  if (file.size > maxBytes) throw new Error("File must be under 2 MB");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
