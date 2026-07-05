import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Brush,
  Circle,
  Crosshair,
  Eye,
  Lock,
  Magnet,
  Minus,
  Trash2,
  TrendingUp,
  Type,
  ZoomIn,
} from "lucide-react";
import {
  useChartDrawing,
  type DrawToolId,
} from "@/components/trading/chart-drawings";
import {
  XM_BORDER,
  XM_CARD_BG,
  XM_CHART_BG,
  XM_CHART_DRAWING_W,
  XM_ICON,
  XM_ICON_BTN,
  XM_ICON_SIZE,
  XM_ICON_STROKE,
  XM_ROW_CHART_FOOTER_H,
  XM_TEXT,
  XM_TEXT_MUTED,
} from "@/lib/xm-trading-tokens";
import { cn } from "@/lib/utils";

const railIcon = { width: XM_ICON_SIZE, height: XM_ICON_SIZE, strokeWidth: XM_ICON_STROKE };
const railBtn = {
  width: XM_ICON_BTN,
  height: XM_ICON_BTN,
};

const DRAW_TOOLS: { id: DrawToolId | "clear"; icon: typeof TrendingUp; label: string }[] = [
  { id: "trend", icon: TrendingUp, label: "Trend line" },
  { id: "horizontal", icon: Minus, label: "Horizontal line" },
  { id: "fibonacci", icon: TrendingUp, label: "Fibonacci" },
  { id: "text", icon: Type, label: "Text" },
  { id: "brush", icon: Brush, label: "Brush" },
  { id: "marker", icon: Circle, label: "Marker" },
  { id: "zoom", icon: ZoomIn, label: "Zoom" },
  { id: "clear", icon: Trash2, label: "Clear all" },
];

/** Extra tools to match TradingView / XM left rail density */
const EXTRA_TOOLS: { label: string; icon: typeof Magnet }[] = [
  { label: "Magnet mode", icon: Magnet },
  { label: "Lock drawings", icon: Lock },
  { label: "Hide drawings", icon: Eye },
];

export function ChartDrawingSidebar() {
  const drawing = useChartDrawing();

  return (
    <aside
      className="relative z-30 flex shrink-0 flex-col items-center gap-0.5 border-r py-1"
      style={{
        width: XM_CHART_DRAWING_W,
        borderColor: XM_BORDER,
        background: XM_CHART_BG,
      }}
    >
      <button
        type="button"
        title="Crosshair"
        className="grid place-items-center rounded hover:bg-accent"
        style={{ ...railBtn, color: XM_ICON }}
        aria-label="Crosshair"
      >
        <Crosshair style={railIcon} />
      </button>
      {DRAW_TOOLS.map(({ id, icon: Icon, label }) => {
        const active = id !== "clear" && drawing?.activeTool === id;
        return (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => {
              if (id === "clear") {
                drawing?.clearDrawings();
                drawing?.setActiveTool(null);
                return;
              }
              drawing?.toggleTool(id);
            }}
            className={cn(
              "grid place-items-center rounded transition-colors",
              active
                ? "bg-accent text-gold"
                : "hover:bg-accent",
            )}
            style={{ ...railBtn, color: active ? undefined : XM_ICON }}
          >
            <Icon style={railIcon} />
          </button>
        );
      })}
      {EXTRA_TOOLS.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          title={label}
          aria-label={label}
          className="grid place-items-center rounded hover:bg-accent"
          style={{ ...railBtn, color: XM_ICON }}
        >
          <Icon style={railIcon} />
        </button>
      ))}
    </aside>
  );
}

export function ChartRangeFooter({
  range,
  onRangeChange,
  trailing,
}: {
  range: string;
  onRangeChange: (r: string) => void;
  trailing?: ReactNode;
}) {
  const ranges = ["1H", "1D", "1W", "1M", "3M", "1Y", "MAX"];
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-3"
      style={{
        height: XM_ROW_CHART_FOOTER_H,
        borderColor: XM_BORDER,
        background: XM_CARD_BG,
      }}
    >
      <div className="flex flex-wrap items-center gap-0.5">
        {ranges.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onRangeChange(r)}
            className={cn(
              "rounded px-2 py-0.5 font-mono text-[11px] transition-colors",
              range === r
                ? "bg-accent font-semibold"
                : "hover:bg-accent",
            )}
            style={{ color: range === r ? XM_TEXT : XM_TEXT_MUTED }}
          >
            {r}
          </button>
        ))}
      </div>
      <div
        className="flex items-center gap-3 font-mono text-[11px]"
        style={{ color: XM_TEXT_MUTED }}
      >
        <span>
          {clock || "—:—:—"} UTC+3
        </span>
        <span className="cursor-pointer hover:text-foreground">%</span>
        <span className="cursor-pointer hover:text-foreground">log</span>
        <span className="font-medium" style={{ color: XM_TEXT }}>
          auto
        </span>
        {trailing ?? (
          <button
            type="button"
            className="grid h-5 w-5 place-items-center rounded hover:text-foreground"
            aria-label="Chart settings"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
