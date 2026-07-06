import { BarChart2, Image, Maximize2, Radio, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import {
  XM_BORDER,
  XM_CHART_BG,
  XM_CHART_UTILITY_W,
  XM_ICON,
  XM_ICON_BTN,
  XM_ICON_HOVER,
  XM_ICON_SIZE,
  XM_ICON_STROKE,
} from "@/lib/xm-trading-tokens";
import { cn } from "@/lib/utils";

const railBtn =
  "grid place-items-center rounded transition-colors hover:bg-accent";

/** XM far-right utility strip — starts below account row */
export function ChartRightRail({
  panelOpen,
  onTogglePanel,
  isFavorite,
  onToggleFavorite,
}: {
  panelOpen: boolean;
  onTogglePanel: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const iconClass = "shrink-0";
  const iconStyle = { width: XM_ICON_SIZE, height: XM_ICON_SIZE, strokeWidth: XM_ICON_STROKE };

  return (
    <aside
      className="flex shrink-0 flex-col border-l pt-1"
      style={{
        width: XM_CHART_UTILITY_W,
        borderColor: XM_BORDER,
        background: XM_CHART_BG,
      }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <motion.button
          type="button"
          title={panelOpen ? "Close trade panel" : "Open trade panel"}
          aria-label={panelOpen ? "Close trade panel" : "Open trade panel"}
          aria-pressed={panelOpen}
          onClick={onTogglePanel}
          className={cn(
            railBtn,
            "rounded-md",
            panelOpen && "bg-accent text-white",
          )}
          style={{
            width: XM_ICON_BTN,
            height: XM_ICON_BTN,
            color: panelOpen ? XM_ICON_HOVER : XM_ICON,
          }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.12 }}
        >
          <Maximize2 className={iconClass} style={iconStyle} />
        </motion.button>

        {onToggleFavorite && (
          <button
            type="button"
            title="Watchlist"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={onToggleFavorite}
            className={railBtn}
            style={{
              width: XM_ICON_BTN,
              height: XM_ICON_BTN,
              color: isFavorite ? "var(--foreground)" : XM_ICON,
            }}
          >
            <Star
              className={cn(iconClass, isFavorite && "fill-current")}
              style={iconStyle}
            />
          </button>
        )}

        <button
          type="button"
          title="Insights"
          className={railBtn}
          style={{ width: XM_ICON_BTN, height: XM_ICON_BTN, color: XM_ICON }}
          aria-label="Insights"
        >
          <Sparkles className={iconClass} style={iconStyle} />
        </button>

        <button
          type="button"
          title="Trading signals"
          className={railBtn}
          style={{ width: XM_ICON_BTN, height: XM_ICON_BTN, color: XM_ICON }}
          aria-label="Trading signals"
        >
          <Radio className={iconClass} style={iconStyle} />
        </button>

        <button
          type="button"
          title="Market analysis"
          className={railBtn}
          style={{ width: XM_ICON_BTN, height: XM_ICON_BTN, color: XM_ICON }}
          aria-label="Market analysis"
        >
          <BarChart2 className={iconClass} style={iconStyle} />
        </button>

        <button
          type="button"
          title="Chart gallery"
          className={railBtn}
          style={{ width: XM_ICON_BTN, height: XM_ICON_BTN, color: XM_ICON }}
          aria-label="Chart gallery"
        >
          <Image className={iconClass} style={iconStyle} />
        </button>
      </div>
    </aside>
  );
}
