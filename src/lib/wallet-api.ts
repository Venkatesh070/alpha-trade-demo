import { authFetch, publicFetch } from "@/lib/api-client";
import type { PaymentSettings, DepositRequest } from "@/lib/admin-api";

export interface WalletTxn {
  id: string;
  type: "Deposit" | "Withdrawal";
  method: string;
  amount: number;
  status: "Completed" | "Pending" | "Rejected";
  date: string;
  createdAt?: number;
  referenceId?: string;
  depositRequestId?: string;
  accountNumber?: string;
  ifsc?: string;
}

export interface WalletData {
  balance: number;
  transactions: WalletTxn[];
  isFunded: boolean;
  minTradingBalance: number;
}

async function parseJson<T>(res: Response): Promise<T & { error?: string }> {
  return (await res.json()) as T & { error?: string };
}

export async function fetchWallet(): Promise<WalletData> {
  const res = await authFetch("/api/wallet");
  const data = await parseJson<{ wallet: WalletData }>(res);
  if (!res.ok) throw new Error(data.error ?? "Failed to load wallet.");
  return data.wallet;
}

export async function fetchPaymentSettings(): Promise<PaymentSettings> {
  const res = await publicFetch("/api/wallet/payment-settings");
  const data = await parseJson<{ settings: PaymentSettings }>(res);
  if (!res.ok) throw new Error(data.error ?? "Failed to load payment settings.");
  return data.settings;
}

export async function submitDepositRequestApi(input: {
  amount: number;
  referenceId: string;
  screenshot: string;
}): Promise<{ request: DepositRequest; wallet: WalletData }> {
  const res = await authFetch("/api/wallet/deposit-requests", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ request: DepositRequest; wallet: WalletData }>(res);
  if (!res.ok) throw new Error(data.error ?? "Failed to submit deposit request.");
  return data;
}

export async function submitWithdrawalApi(input: {
  amount: number;
  accountNumber: string;
  ifsc: string;
}): Promise<WalletData> {
  const res = await authFetch("/api/wallet/withdrawals", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ wallet: WalletData }>(res);
  if (!res.ok) throw new Error(data.error ?? "Failed to submit withdrawal.");
  return data.wallet;
}

export async function fetchDepositRequests(): Promise<DepositRequest[]> {
  const res = await authFetch("/api/wallet/deposit-requests");
  const data = await parseJson<{ requests: DepositRequest[] }>(res);
  if (!res.ok) throw new Error(data.error ?? "Failed to load deposit requests.");
  return data.requests;
}
