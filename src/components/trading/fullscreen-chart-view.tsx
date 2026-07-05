import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExpandedChartShell, type ChartRange, type ChartTimeframe } from "@/components/trading/expanded-chart";
import { XM_CHART_BG } from "@/lib/xm-trading-tokens";
import type { Asset } from "@/data/markets";

const panelEase = [0.4, 0, 0.2, 1] as const;

export function FullscreenChartShell({
  symbol,
  asset: _asset,
  timeframe,
  onTimeframeChange,
  range,
  onRangeChange,
  onClose,
  onSymbolChange,
  price,
  changePct,
  isFavorite,
  onToggleFavorite,
  children,
}: {
  symbol: string;
  asset?: Asset;
  timeframe: ChartTimeframe;
  onTimeframeChange: (tf: ChartTimeframe) => void;
  range: ChartRange;
  onRangeChange: (r: ChartRange) => void;
  onClose: () => void;
  onSymbolChange?: (s: string) => void;
  price: number;
  changePct: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[300] flex h-dvh w-screen flex-col overflow-hidden text-foreground"
      style={{ background: XM_CHART_BG }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: panelEase }}
    >
      <motion.div
        className="flex h-full min-h-0 flex-1 flex-col"
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.985 }}
        transition={{ duration: 0.28, ease: panelEase }}
      >
        <ExpandedChartShell
          symbol={symbol}
          onSymbolChange={onSymbolChange}
          timeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
          range={range}
          onRangeChange={onRangeChange}
          onClose={onClose}
          price={price}
          changePct={changePct}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          hideSidePanel
        >
          {children}
        </ExpandedChartShell>
      </motion.div>
    </motion.div>
  );
}

export type { ChartTimeframe } from "@/components/trading/expanded-chart";
