import type { ReactNode } from "react";
import { ChartDrawingSidebar, ChartRangeFooter } from "@/components/trading/chart-panels";
import { ChartOhlcOverlay, TradingViewWatermark } from "@/components/trading/chart-overlays";
import { MarketStatusBanner } from "@/components/trading/market-status-banner";
import { CHART_BODY_BG } from "@/lib/chart-layout";
import { XM_CHART_BG } from "@/lib/xm-trading-tokens";
import type { Asset } from "@/data/markets";

export function ChartBody({
  asset,
  price,
  changePct,
  range,
  onRangeChange,
  showMarketStatus = true,
  drawingOverlay,
  children,
}: {
  asset?: Asset;
  price: number;
  changePct: number;
  range: string;
  onRangeChange: (r: string) => void;
  showMarketStatus?: boolean;
  drawingOverlay?: ReactNode;
  children: ReactNode;
}) {
  const spread = asset?.spread ?? 2;
  const pip = asset?.category === "crypto" ? price * 0.0001 : 0.0001;
  const ask = price + spread * pip;
  const bid = price - spread * pip;
  const spreadDisplay = spread * pip;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden" style={{ background: XM_CHART_BG }}>
      <ChartDrawingSidebar />

      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        style={{ background: CHART_BODY_BG }}
      >
        <div className="relative min-h-0 flex-1 overflow-hidden" style={{ background: CHART_BODY_BG }}>
          {asset && (
            <ChartOhlcOverlay
              asset={asset}
              price={price}
              changePct={changePct}
              bid={bid}
              ask={ask}
              spread={spreadDisplay}
            />
          )}
          {showMarketStatus && asset && <MarketStatusBanner asset={asset} />}
          {children}
          {drawingOverlay}
          <TradingViewWatermark />
        </div>

        <ChartRangeFooter range={range} onRangeChange={onRangeChange} />
      </div>
    </div>
  );
}

export { XM_CHART_DRAWING_W as CHART_LEFT_RAIL_W } from "@/lib/xm-trading-tokens";
