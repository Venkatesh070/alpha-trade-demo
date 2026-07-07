import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { pushNotification } from "@/lib/notifications-db";
import {
  fetchWallet,
  submitDepositRequestApi,
  submitWithdrawalApi,
  type WalletData,
  type WalletTxn,
} from "@/lib/wallet-api";

export const MIN_TRADING_BALANCE = 5000;

interface WalletCtx {
  balance: number;
  transactions: WalletTxn[];
  loading: boolean;
  canTrade: boolean;
  isFunded: boolean;
  submitDepositRequest: (amount: number, referenceId: string, screenshot: string) => Promise<void>;
  withdraw: (amount: number, accountNumber: string, ifsc: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WalletContext = createContext<WalletCtx | null>(null);

const emptyWallet: WalletData = {
  balance: 0,
  transactions: [],
  isFunded: false,
  minTradingBalance: MIN_TRADING_BALANCE,
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<WalletData>(emptyWallet);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWallet(emptyWallet);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchWallet();
      setWallet(data);
    } catch {
      setWallet(emptyWallet);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitDepositRequest = useCallback(
    async (amount: number, referenceId: string, screenshot: string) => {
      if (!user?.email) {
        throw new Error("You must be signed in to submit a deposit.");
      }

      const { wallet: updated } = await submitDepositRequestApi({
        amount,
        referenceId,
        screenshot,
      });
      setWallet(updated);

      pushNotification(user.email, {
        type: "deposit",
        title: "Deposit request submitted",
        body: `₹${amount.toLocaleString("en-IN")} is pending admin approval.`,
      });
    },
    [user?.email],
  );

  const withdraw = useCallback(
    async (amount: number, accountNumber: string, ifsc: string) => {
      if (!user?.email) {
        throw new Error("You must be signed in to withdraw.");
      }

      const updated = await submitWithdrawalApi({ amount, accountNumber, ifsc });
      setWallet(updated);

      pushNotification(user.email, {
        type: "deposit",
        title: "Withdrawal initiated",
        body: `₹${amount.toLocaleString("en-IN")} bank transfer is being processed.`,
      });
    },
    [user?.email],
  );

  const value = useMemo<WalletCtx>(
    () => ({
      balance: wallet.balance,
      transactions: wallet.transactions,
      loading,
      canTrade: wallet.isFunded,
      isFunded: wallet.isFunded,
      submitDepositRequest,
      withdraw,
      refresh,
    }),
    [wallet, loading, submitDepositRequest, withdraw, refresh],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

export type { WalletTxn };
