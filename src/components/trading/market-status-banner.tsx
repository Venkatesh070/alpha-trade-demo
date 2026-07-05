import { useEffect, useState } from "react";
import type { Asset } from "@/data/markets";
import {
  formatReopenCountdown,
  formatReopenDate,
  getMarketStatus,
} from "@/lib/market-status";
import { CHART_BORDER, CHART_HEADER_BG, CHART_MUTED, CHART_RIGHT_RAIL_W, CHART_TEXT } from "@/lib/chart-layout";

export function MarketStatusBanner({ asset }: { asset: Asset }) {
  const status = getMarketStatus(asset);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!status.reopensAt) return;
    const tick = () => setCountdown(formatReopenCountdown(status.reopensAt!));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [status.reopensAt]);

  if (status.open) return null;

  const pill =
    "rounded-lg border px-4 py-2 shadow-sm backdrop-blur-sm whitespace-nowrap";

  return (
    <div
      className="pointer-events-none absolute top-2 z-20 flex flex-col items-end gap-1.5"
      style={{ right: CHART_RIGHT_RAIL_W + 8 }}
    >
      <div
        className={pill}
        style={{
          borderColor: CHART_BORDER,
          background: `${CHART_HEADER_BG}f2`,
          color: CHART_TEXT,
        }}
      >
        <p className="text-[13px] font-normal leading-none">
          Closed until {status.reopensAt ? formatReopenDate(status.reopensAt) : "—"}
        </p>
      </div>
      {countdown && (
        <div
          className={pill}
          style={{
            borderColor: CHART_BORDER,
            background: `${CHART_HEADER_BG}f2`,
          }}
        >
          <div className="flex items-center gap-2 text-[13px] leading-none">
            <span className="h-2 w-2 shrink-0 rounded-full bg-destructive" />
            <span style={{ color: CHART_MUTED }}>Opens in:</span>
            <span className="font-semibold tabular-nums" style={{ color: CHART_TEXT }}>
              {countdown}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
