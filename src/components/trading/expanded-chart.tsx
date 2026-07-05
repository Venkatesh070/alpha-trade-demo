import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChartDrawingOverlay,
  ChartDrawingProvider,
  useChartDrawing,
} from "@/components/trading/chart-drawings";
import { ChartTerminalHeader, ChartHeaderAccountRow } from "@/components/trading/chart-terminal-header";
import { useExpandedTradingActions } from "@/components/trading/expanded/expanded-trading-actions";
import { ChartBody } from "@/components/trading/chart-body";
import { ChartRightRail } from "@/components/trading/chart-right-rail";
import { MarketStatusSidePanel } from "@/components/trading/market-status-panel";
import { CHART_BODY_BG } from "@/lib/chart-layout";
import { XM_STATUS_PANEL_W } from "@/lib/xm-trading-tokens";
import { getMarketStatus } from "@/lib/market-status";
import { getAsset } from "@/data/markets";

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1H", "4H", "1D"] as const;
const RANGES = ["1H", "1D", "1W", "1M", "3M", "1Y", "MAX"] as const;

export type ChartTimeframe = (typeof TIMEFRAMES)[number];
export type ChartRange = (typeof RANGES)[number];

const panelEase = [0.4, 0, 0.2, 1] as const;
const panelTransition = { duration: 0.24, ease: panelEase };

function AnimatedStatusPanel({
  asset,
  price,
}: {
  asset: NonNullable<ReturnType<typeof getAsset>>;
  price: number;
}) {
  return (
    <motion.aside
      className="flex h-full shrink-0 overflow-hidden border-l"
      style={{ borderColor: "var(--border)" }}
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: XM_STATUS_PANEL_W, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={panelTransition}
    >
      <div className="h-full shrink-0" style={{ width: XM_STATUS_PANEL_W }}>
        <MarketStatusSidePanel asset={asset} price={price} />
      </div>
    </motion.aside>
  );
}

function ExpandedChartContent({
  symbol,
  onSymbolChange,
  timeframe,
  onTimeframeChange,
  range,
  onRangeChange,
  onExpand,
  onClose,
  price,
  changePct,
  isFavorite,
  onToggleFavorite,
  hideSidePanel = false,
  children,
}: {
  symbol: string;
  onSymbolChange?: (s: string) => void;
  timeframe: ChartTimeframe;
  onTimeframeChange: (tf: ChartTimeframe) => void;
  range: ChartRange;
  onRangeChange: (r: ChartRange) => void;
  onExpand?: () => void;
  onClose?: () => void;
  price: number;
  changePct: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  /** Fullscreen — hide market status panel + utility rail */
  hideSidePanel?: boolean;
  children: ReactNode;
}) {
  const drawing = useChartDrawing();
  const asset = getAsset(symbol);
  const changeAbs = asset ? (price * changePct) / 100 : 0;
  const marketClosed = asset ? !getMarketStatus(asset).open : false;
  const { onOpenManage } = useExpandedTradingActions();

  const [statusPanelOpen, setStatusPanelOpen] = useState(marketClosed && !hideSidePanel);

  useEffect(() => {
    if (hideSidePanel) {
      setStatusPanelOpen(false);
      return;
    }
    if (marketClosed) setStatusPanelOpen(true);
  }, [symbol, marketClosed, hideSidePanel]);

  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: CHART_BODY_BG }}
    >
      {!hideSidePanel && (
        <ChartHeaderAccountRow onOpenManage={onOpenManage} showRailSpacer />
      )}

      {hideSidePanel ? (
        <>
          <ChartTerminalHeader
            symbol={symbol}
            onSymbolChange={onSymbolChange}
            asset={asset}
            timeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            changeAbs={changeAbs}
            changePct={changePct}
            onClose={onClose}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            canUndo={drawing?.canUndo}
            canRedo={drawing?.canRedo}
            onUndo={() => drawing?.undo()}
            onRedo={() => drawing?.redo()}
            fullscreen
          />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <ChartBody
              asset={asset}
              price={price}
              changePct={changePct}
              range={range}
              onRangeChange={(r) => onRangeChange(r as ChartRange)}
              showMarketStatus={false}
              drawingOverlay={<ChartDrawingOverlay />}
            >
              {children}
            </ChartBody>
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <ChartTerminalHeader
              symbol={symbol}
              onSymbolChange={onSymbolChange}
              asset={asset}
              timeframe={timeframe}
              onTimeframeChange={onTimeframeChange}
              changeAbs={changeAbs}
              changePct={changePct}
              onExpand={onExpand}
              onClose={onClose}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              canUndo={drawing?.canUndo}
              canRedo={drawing?.canRedo}
              onUndo={() => drawing?.undo()}
              onRedo={() => drawing?.redo()}
              stackRightPanel
            />

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <ChartBody
                asset={asset}
                price={price}
                changePct={changePct}
                range={range}
                onRangeChange={(r) => onRangeChange(r as ChartRange)}
                showMarketStatus={false}
                drawingOverlay={<ChartDrawingOverlay />}
              >
                {children}
              </ChartBody>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {statusPanelOpen && asset && (
              <AnimatedStatusPanel key={`status-${symbol}`} asset={asset} price={price} />
            )}
          </AnimatePresence>

          <ChartRightRail
            panelOpen={statusPanelOpen}
            onTogglePanel={() => setStatusPanelOpen((o) => !o)}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      )}
    </div>
  );
}

export function ExpandedChartShell({
  symbol,
  onSymbolChange,
  timeframe,
  onTimeframeChange,
  range,
  onRangeChange,
  onExpand,
  onClose,
  price,
  changePct,
  isFavorite,
  onToggleFavorite,
  hideSidePanel = false,
  children,
}: {
  symbol: string;
  onSymbolChange?: (s: string) => void;
  timeframe: ChartTimeframe;
  onTimeframeChange: (tf: ChartTimeframe) => void;
  range: ChartRange;
  onRangeChange: (r: ChartRange) => void;
  onExpand?: () => void;
  onClose?: () => void;
  price: number;
  changePct: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  hideSidePanel?: boolean;
  children: ReactNode;
}) {
  return (
    <ChartDrawingProvider>
      <ExpandedChartContent
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        timeframe={timeframe}
        onTimeframeChange={onTimeframeChange}
        range={range}
        onRangeChange={onRangeChange}
        onExpand={onExpand}
        onClose={onClose}
        price={price}
        changePct={changePct}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        hideSidePanel={hideSidePanel}
      >
        {children}
      </ExpandedChartContent>
    </ChartDrawingProvider>
  );
}

export { TIMEFRAMES, RANGES };
