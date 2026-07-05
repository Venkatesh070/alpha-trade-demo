import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { PanelLeftOpen } from "lucide-react";
import { TradingIconSidebar } from "@/components/trading/trading-icon-sidebar";
import { AccountStatusBar } from "@/components/trading/expanded/account-status-bar";
import { AccountManagePanel } from "@/components/trading/expanded/account-manage-panel";
import { ExpandedTradingActionsProvider } from "@/components/trading/expanded/expanded-trading-actions";
import { MARKET_SIDEBAR } from "@/lib/market-display";
import { TRADING_MARKET_W, TRADING_SHELL_BG } from "@/lib/chart-layout";
import { XM_ICON_BTN, XM_ICON_SIZE, XM_ICON_STROKE, XM_ROW_MARKET_HEADER_H } from "@/lib/xm-trading-tokens";
import { cn } from "@/lib/utils";

const MARKET_COLLAPSED_W = 40;
const panelEase = [0.4, 0, 0.2, 1] as const;
const panelTransition = { duration: 0.24, ease: panelEase };

export function ExpandedTradingView({
  embedded = false,
  onNavigate,
  marketsPanel,
  chart,
  orderPanel,
  showOrderPanel = false,
  marketsOpen: marketsOpenProp,
  onMarketsOpenChange,
  showNavRail = true,
}: {
  embedded?: boolean;
  onNavigate?: () => void;
  marketsPanel: ReactNode;
  chart: ReactNode;
  orderPanel?: ReactNode;
  showOrderPanel?: boolean;
  marketsOpen?: boolean;
  onMarketsOpenChange?: (open: boolean) => void;
  /** Far-left app nav rail — hidden when app layout already shows icon sidebar */
  showNavRail?: boolean;
}) {
  const [manageOpen, setManageOpen] = useState(false);
  const [marketsOpenInternal, setMarketsOpenInternal] = useState(true);
  const marketsOpen = marketsOpenProp ?? marketsOpenInternal;
  const setMarketsOpen = onMarketsOpenChange ?? setMarketsOpenInternal;

  return (
    <ExpandedTradingActionsProvider onOpenManage={() => setManageOpen(true)}>
      <div
        className={cn(
          "flex w-full flex-col overflow-hidden text-foreground",
          embedded ? "h-full min-h-0" : "fixed inset-0 z-[200] h-dvh",
        )}
        style={{ background: TRADING_SHELL_BG }}
      >
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {showNavRail && <TradingIconSidebar onNavigate={onNavigate} />}

          <motion.aside
            className="flex shrink-0 flex-col overflow-hidden border-r"
            style={{ borderColor: MARKET_SIDEBAR.border, background: MARKET_SIDEBAR.bg }}
            initial={false}
            animate={{ width: marketsOpen ? TRADING_MARKET_W : MARKET_COLLAPSED_W }}
            transition={panelTransition}
          >
            {marketsOpen ? (
              <div className="flex h-full flex-col" style={{ width: TRADING_MARKET_W }}>
                {marketsPanel}
              </div>
            ) : (
              <div
                className="flex shrink-0 items-center justify-center"
                style={{ width: MARKET_COLLAPSED_W, height: XM_ROW_MARKET_HEADER_H }}
              >
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.18, ease: panelEase, delay: 0.08 }}
                  onClick={() => setMarketsOpen(true)}
                  className="grid place-items-center rounded border border-border bg-card text-muted-foreground hover:text-foreground"
                  style={{ width: XM_ICON_BTN, height: XM_ICON_BTN }}
                  aria-label="Open markets panel"
                >
                  <PanelLeftOpen
                    style={{ width: XM_ICON_SIZE, height: XM_ICON_SIZE, strokeWidth: XM_ICON_STROKE }}
                  />
                </motion.button>
              </div>
            )}
          </motion.aside>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
            <div className="relative flex min-h-0 flex-1 overflow-hidden">
              <main className="relative flex min-w-0 flex-1 overflow-hidden">{chart}</main>
              {showOrderPanel &&
                (manageOpen ? (
                  <AccountManagePanel onClose={() => setManageOpen(false)} />
                ) : (
                  orderPanel
                ))}
              {!showOrderPanel && manageOpen && (
                <AccountManagePanel onClose={() => setManageOpen(false)} />
              )}
            </div>
            <AccountStatusBar />
          </div>
        </div>
      </div>
    </ExpandedTradingActionsProvider>
  );
}
