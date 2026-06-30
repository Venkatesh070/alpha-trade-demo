import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { addDepositRequest } from "@/lib/payments";
import { emptyWallet, getWallet, updateWallet, type WalletState } from "@/lib/wallet-db";

export const MIN_TRADING_BALANCE = 5000;

interface WalletCtx {
  balance: number;
  transactions: WalletState["transactions"];
  loading: boolean;
  canTrade: boolean;
  deposit: (amount: number, method: string) => void;
  withdraw: (amount: number, method: string) => void;
  submitDepositRequest: (amount: number, referenceId: string, screenshot: string) => void;
  refresh: () => void;
}

const WalletContext = createContext<WalletCtx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletState>(emptyWallet);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!user?.email) {
      setWallet(emptyWallet());
      return;
    }
    setWallet(getWallet(user.email));
  }, [user?.email]);

  useEffect(() => {
    refresh();
    setLoading(false);
  }, [refresh]);

  const persist = useCallback((updater: (prev: WalletState) => WalletState) => {
    if (!user?.email) return;
    const next = updateWallet(user.email, updater);
    setWallet(next);
  }, [user?.email]);

  const deposit = useCallback((amount: number, method: string) => {
    if (!user?.email || amount <= 0) return;
    persist((prev) => ({
      balance: prev.balance + amount,
      transactions: [{
        id: `txn-${Date.now()}`,
        type: "Deposit",
        method,
        amount,
        status: "Completed",
        date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      }, ...prev.transactions],
    }));
  }, [persist, user?.email]);

  const withdraw = useCallback((amount: number, method: string) => {
    if (!user?.email || amount <= 0) return;
    persist((prev) => {
      if (amount > prev.balance) return prev;
      return {
        balance: prev.balance - amount,
        transactions: [{
          id: `txn-${Date.now()}`,
          type: "Withdrawal",
          method,
          amount: -amount,
          status: "Completed",
          date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        }, ...prev.transactions],
      };
    });
  }, [persist, user?.email]);

  const submitDepositRequest = useCallback((amount: number, referenceId: string, screenshot: string) => {
    if (!user?.email) return;
    addDepositRequest({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      amount,
      referenceId,
      screenshot,
    });
    refresh();
  }, [refresh, user]);

  const value = useMemo<WalletCtx>(() => ({
    balance: wallet.balance,
    transactions: wallet.transactions,
    loading,
    canTrade: wallet.balance >= MIN_TRADING_BALANCE,
    deposit,
    withdraw,
    submitDepositRequest,
    refresh,
  }), [wallet.balance, wallet.transactions, loading, deposit, withdraw, submitDepositRequest, refresh]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

// Re-export for consumers that imported from here before
export type { WalletTxn } from "@/lib/wallet-db";
