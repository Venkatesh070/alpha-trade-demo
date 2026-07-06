import { useWallet } from "@/hooks/use-wallet";
import { useTrading } from "@/hooks/use-trading";
import { useLivePrices } from "@/hooks/use-live-prices";
import { ALL_ASSETS } from "@/data/markets";
import { calcAccountMetrics, formatInr } from "@/lib/account-metrics";
import {
  XM_BORDER,
  XM_ROW_STATUS_BAR_H,
  XM_SHELL_BG,
  XM_TEXT,
  XM_TEXT_MUTED,
  XM_FONT_STATUS,
} from "@/lib/xm-trading-tokens";

export function AccountStatusBar() {
  const { balance } = useWallet();
  const { openPositions, closedTrades } = useTrading();
  const live = useLivePrices(4000);

  const prices = Object.fromEntries(
    ALL_ASSETS.map((asset) => [asset.symbol, live[asset.symbol]?.price ?? asset.price]),
  );
  const metrics = calcAccountMetrics({
    balance,
    openPositions,
    closedTrades,
    prices,
  });
  const marginLevel =
    metrics.margin > 0 ? `${((metrics.equity / metrics.margin) * 100).toFixed(0)}%` : "—";

  const items = [
    { label: "Balance", value: formatInr(metrics.balance) },
    { label: "Equity", value: formatInr(metrics.equity) },
    { label: "Free Margin", value: formatInr(metrics.freeMargin) },
    { label: "Margin", value: formatInr(metrics.margin) },
    { label: "Margin Level", value: marginLevel },
  ];

  return (
    <footer
      className="flex shrink-0 items-center justify-end gap-5 border-t px-4"
      style={{
        height: XM_ROW_STATUS_BAR_H,
        borderColor: XM_BORDER,
        background: XM_SHELL_BG,
        color: XM_TEXT_MUTED,
        fontSize: XM_FONT_STATUS,
      }}
    >
      {items.map(({ label, value }) => (
        <span key={label} className="whitespace-nowrap">
          {label}:{" "}
          <span
            className="font-mono font-semibold tabular-nums"
            style={{ color: XM_TEXT, fontSize: "11px" }}
          >
            {value}
          </span>
        </span>
      ))}
    </footer>
  );
}
