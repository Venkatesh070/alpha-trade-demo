import { createContext, useContext, type ReactNode } from "react";

const ExpandedTradingActionsContext = createContext<{ onOpenManage: () => void } | null>(null);

export function ExpandedTradingActionsProvider({
  onOpenManage,
  children,
}: {
  onOpenManage: () => void;
  children: ReactNode;
}) {
  return (
    <ExpandedTradingActionsContext.Provider value={{ onOpenManage }}>
      {children}
    </ExpandedTradingActionsContext.Provider>
  );
}

export function useExpandedTradingActions() {
  const ctx = useContext(ExpandedTradingActionsContext);
  return ctx ?? { onOpenManage: () => {} };
}
