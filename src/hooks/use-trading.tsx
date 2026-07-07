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
import { useWallet } from "@/hooks/use-wallet";
import { calcPositionPnl } from "@/lib/account-metrics";
import { randomId } from "@/lib/id";
import { updateWallet } from "@/lib/wallet-db";
import {
  emptyTrading,
  getTrading,
  updateTrading,
  type ClosedTrade,
  type OpenPosition,
} from "@/lib/trading-db";
import { pushNotification } from "@/lib/notifications-db";

interface PlaceOrderInput {
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  type: string;
  price: number;
  sl?: number;
  tp?: number;
}

interface TradingCtx {
  openPositions: OpenPosition[];
  closedTrades: ClosedTrade[];
  loading: boolean;
  placeOrder: (order: PlaceOrderInput) => void;
  closePosition: (id: string, closePrice: number) => void;
  refresh: () => void;
  syncLivePnl: (prices: Record<string, number | undefined>) => void;
}

const TradingContext = createContext<TradingCtx | null>(null);

export function TradingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { refresh: refreshWallet } = useWallet();
  const [state, setState] = useState(emptyTrading);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!user?.email) {
      setState(emptyTrading());
      return;
    }
    setState(getTrading(user.email));
  }, [user?.email]);

  useEffect(() => {
    refresh();
    setLoading(false);
  }, [refresh]);

  const persist = useCallback(
    (updater: (prev: ReturnType<typeof emptyTrading>) => ReturnType<typeof emptyTrading>) => {
      if (!user?.email) return;
      const next = updateTrading(user.email, updater);
      setState(next);
    },
    [user?.email],
  );

  const placeOrder = useCallback(
    (order: PlaceOrderInput) => {
      if (!user?.email) return;
      persist((prev) => ({
        ...prev,
        open: [
          {
            id: randomId(),
            openedAt: Date.now(),
            pnl: 0,
            ...order,
          },
          ...prev.open,
        ],
      }));
      pushNotification(user.email, {
        type: "trade",
        title: "Order filled",
        body: `${order.side.toUpperCase()} ${order.qty} ${order.symbol} @ ${order.price.toFixed(4)} executed.`,
      });
    },
    [persist, user?.email],
  );

  const closePosition = useCallback(
    (id: string, closePrice: number) => {
      if (!user?.email) return;
      const current = getTrading(user.email);
      const position = current.open.find((item) => item.id === id);
      if (!position) return;

      const pnl = calcPositionPnl(position, closePrice);
      const closed: ClosedTrade = {
        id: position.id,
        symbol: position.symbol,
        side: position.side,
        qty: position.qty,
        openPrice: position.price,
        closePrice,
        pnl,
        openedAt: position.openedAt,
        closedAt: Date.now(),
      };

      updateTrading(user.email, (prev) => ({
        open: prev.open.filter((item) => item.id !== id),
        closed: [closed, ...prev.closed],
      }));
      updateWallet(user.email, (prev) => ({
        ...prev,
        balance: prev.balance + pnl,
      }));
      refresh();
      refreshWallet();
    },
    [refresh, refreshWallet, user?.email],
  );

  const syncLivePnl = useCallback(
    (prices: Record<string, number | undefined>) => {
      if (!user?.email) return;
      persist((prev) => {
        let changed = false;
        const open = prev.open.map((position) => {
          const current = prices[position.symbol];
          if (current === undefined) return position;
          const pnl = calcPositionPnl(position, current);
          if (Math.abs(pnl - position.pnl) < 0.01) return position;
          changed = true;
          return { ...position, pnl };
        });
        return changed ? { ...prev, open } : prev;
      });
    },
    [persist, user?.email],
  );

  const value = useMemo<TradingCtx>(
    () => ({
      openPositions: state.open,
      closedTrades: state.closed,
      loading,
      placeOrder,
      closePosition,
      refresh,
      syncLivePnl,
    }),
    [state.open, state.closed, loading, placeOrder, closePosition, refresh, syncLivePnl],
  );

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
}

export function useTrading() {
  const ctx = useContext(TradingContext);
  if (!ctx) throw new Error("useTrading must be used within TradingProvider");
  return ctx;
}
