import { useWallet } from "@/hooks/use-wallet";
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

  const items = [
    { label: "Balance", value: `$${balance.toFixed(2)}` },
    { label: "Equity", value: `$${balance.toFixed(2)}` },
    { label: "Free Margin", value: `$${balance.toFixed(2)}` },
    { label: "Margin", value: "—" },
    { label: "Margin Level", value: "—" },
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
