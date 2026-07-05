import { toast } from "sonner";
import type { Asset } from "@/data/markets";
import { formatPrice } from "@/hooks/use-live-prices";
import { useWallet } from "@/hooks/use-wallet";
import { displayMarketSymbol } from "@/lib/market-display";
import {
  XM_BORDER,
  XM_CARD_BG,
  XM_CHART_BG,
  XM_STATUS_PANEL_W,
  XM_TEXT,
  XM_TEXT_MUTED,
} from "@/lib/xm-trading-tokens";

export function MarketStatusSidePanel({ asset, price }: { asset: Asset; price: number }) {
  const { canTrade } = useWallet();
  const spread = asset.spread ?? 2;
  const pip = asset.category === "crypto" ? price * 0.0001 : 0.0001;
  const ask = price + spread * pip;
  const bid = price - spread * pip;
  const spreadDisplay = spread * pip;
  const fmt = (n: number) => formatPrice(asset, n);

  const place = (side: "buy" | "sell") => {
    if (!canTrade) {
      toast.error("Deposit to unlock trading");
      return;
    }
    const px = side === "buy" ? ask : bid;
    toast.success(`${side.toUpperCase()} 1 lot · ${displayMarketSymbol(asset)} @ ${fmt(px)}`);
  };

  return (
    <aside
      className="flex h-full shrink-0 flex-col border-l px-3 py-3"
      style={{
        width: XM_STATUS_PANEL_W,
        borderColor: XM_BORDER,
        background: XM_CHART_BG,
      }}
    >
      <p className="text-[13px] font-semibold" style={{ color: XM_TEXT }}>
        Trade
      </p>
      <p className="mt-0.5 text-[11px]" style={{ color: XM_TEXT_MUTED }}>
        {displayMarketSymbol(asset)}
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={!canTrade}
          onClick={() => place("sell")}
          className="flex flex-col items-center rounded-lg px-3 py-3 text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--destructive)" }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">Sell</span>
          <span className="mt-1 font-mono text-[15px] font-bold tabular-nums">{fmt(bid)}</span>
        </button>

        <div
          className="flex items-center justify-center rounded-md border py-1.5 font-mono text-[11px] tabular-nums"
          style={{ borderColor: XM_BORDER, background: XM_CARD_BG, color: XM_TEXT_MUTED }}
        >
          Spread {spreadDisplay.toFixed(2)}
        </div>

        <button
          type="button"
          disabled={!canTrade}
          onClick={() => place("buy")}
          className="flex flex-col items-center rounded-lg px-3 py-3 text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--success)" }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">Buy</span>
          <span className="mt-1 font-mono text-[15px] font-bold tabular-nums">{fmt(ask)}</span>
        </button>
      </div>
    </aside>
  );
}
