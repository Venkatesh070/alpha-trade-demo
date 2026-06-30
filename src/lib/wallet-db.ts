export const WALLET_STORAGE_KEY = "exness-wallet";

export interface WalletTxn {
  id: string;
  type: "Deposit" | "Withdrawal";
  method: string;
  amount: number;
  status: "Completed" | "Pending" | "Rejected";
  date: string;
  referenceId?: string;
  depositRequestId?: string;
}

export interface WalletState {
  balance: number;
  transactions: WalletTxn[];
}

type WalletDb = Record<string, WalletState>;

export function emptyWallet(): WalletState {
  return { balance: 0, transactions: [] };
}

export function loadWalletDb(): WalletDb {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(WALLET_STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

export function saveWalletDb(db: WalletDb) {
  window.localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(db));
}

export function getWallet(email: string): WalletState {
  return loadWalletDb()[email] ?? emptyWallet();
}

export function updateWallet(email: string, updater: (prev: WalletState) => WalletState) {
  const db = loadWalletDb();
  const next = updater(db[email] ?? emptyWallet());
  db[email] = next;
  saveWalletDb(db);
  return next;
}

export function creditWallet(
  email: string,
  amount: number,
  method: string,
  opts?: { depositRequestId?: string; referenceId?: string },
) {
  return updateWallet(email, (prev) => {
    const hasPending = opts?.depositRequestId
      && prev.transactions.some((t) => t.depositRequestId === opts.depositRequestId);

    const transactions = hasPending
      ? prev.transactions.map((t) =>
          t.depositRequestId === opts.depositRequestId
            ? { ...t, status: "Completed" as const, method, referenceId: opts.referenceId ?? t.referenceId }
            : t,
        )
      : [{
          id: `txn-${Date.now()}`,
          type: "Deposit" as const,
          method,
          amount,
          status: "Completed" as const,
          date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          referenceId: opts?.referenceId,
          depositRequestId: opts?.depositRequestId,
        }, ...prev.transactions];

    return { balance: prev.balance + amount, transactions };
  });
}
