import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import { useChartDrawing, useChartDrawingLines } from "@/components/trading/chart-drawings";
import { generateCandles, getAsset } from "@/data/markets";
import { useTheme } from "@/hooks/use-theme";
import { themeBackground, themeColor, withAlpha } from "@/lib/theme-colors";

type ChartVariant = "terminal" | "expanded";

function chartColors(variant: ChartVariant, mode: "light" | "dark") {
  const light = mode === "light";
  const gold = themeColor("--gold", "#FFD10C");
  const success = themeColor("--success", light ? "#16a34a" : "#22c55e");
  const destructive = themeColor("--destructive", light ? "#dc2626" : "#ef4444");
  const grid = themeBackground(
    "--border",
    light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
  );
  const crosshair = withAlpha(gold, 0.4);

  if (variant === "expanded") {
    return {
      background: themeBackground("--background", light ? "#ffffff" : "#0F1A15"),
      text: themeColor("--muted-foreground", light ? "#64748b" : "#94a3b8"),
      grid,
      border: grid,
      crosshair,
      crosshairLabel: gold,
      up: success,
      down: destructive,
    };
  }
  return {
    background: "transparent",
    text: themeColor(
      "--muted-foreground",
      light ? "rgba(15,23,42,0.65)" : "rgba(245,240,224,0.7)",
    ),
    grid: withAlpha(themeBackground("--border", light ? "#000000" : "#ffffff"), 0.04),
    border: withAlpha(themeBackground("--border", light ? "#000000" : "#ffffff"), 0.08),
    crosshair,
    crosshairLabel: gold,
    up: success,
    down: destructive,
  };
}

export function TradingChart({
  symbol,
  timeframe,
  variant = "terminal",
}: {
  symbol: string;
  timeframe: string;
  variant?: ChartVariant;
}) {
  const { theme } = useTheme();
  const drawing = useChartDrawing();
  const drawingRef = useRef(drawing);
  drawingRef.current = drawing;
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLineRef = useRef<ReturnType<ISeriesApi<"Candlestick">["createPriceLine"]> | null>(
    null,
  );

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const colors = chartColors(variant, theme);

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight,
      layout: {
        background: { color: colors.background },
        textColor: colors.text,
        fontFamily: "Montserrat, ui-sans-serif, sans-serif",
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      rightPriceScale: {
        borderColor: colors.border,
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: variant === "expanded",
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      crosshair: {
        vertLine: { color: colors.crosshair, labelBackgroundColor: colors.crosshairLabel },
        horzLine: { color: colors.crosshair, labelBackgroundColor: colors.crosshairLabel },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: colors.up,
      downColor: colors.down,
      wickUpColor: colors.up,
      wickDownColor: colors.down,
      borderVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    if (variant === "expanded") {
      drawingRef.current?.registerChart({ chart, series });
    }

    const ro = new ResizeObserver(() => {
      if (!chartRef.current || !el) return;
      chartRef.current.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      priceLineRef.current = null;
      if (variant === "expanded") {
        drawingRef.current?.unregisterChart();
      }
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [variant, theme]);

  useChartDrawingLines(chartRef, seriesRef);

  useEffect(() => {
    if (!seriesRef.current) return;
    const asset = getAsset(symbol);
    const data = generateCandles(symbol + timeframe, 240, asset?.price ?? 100).map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();

    if (priceLineRef.current) {
      seriesRef.current.removePriceLine(priceLineRef.current);
      priceLineRef.current = null;
    }

    const lastClose = data[data.length - 1]?.close;
    if (variant === "expanded" && lastClose !== undefined) {
      priceLineRef.current = seriesRef.current.createPriceLine({
        price: lastClose,
        color: themeColor("--muted-foreground", theme === "light" ? "#64748b" : "#94a3b8"),
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "",
      });
    }

    let last = data[data.length - 1];
    const id = setInterval(() => {
      if (!seriesRef.current || !last) return;
      const vol = (asset?.category === "crypto" ? 0.003 : 0.001) * last.close;
      const close = Math.max(0.001, last.close + (Math.random() - 0.5) * 2 * vol);
      const next = {
        time: ((last.time as number) + 60 * 15) as Time,
        open: last.close,
        high: Math.max(last.close, close),
        low: Math.min(last.close, close),
        close,
      };
      seriesRef.current.update(next);
      if (priceLineRef.current) {
        priceLineRef.current.applyOptions({ price: close });
      }
      last = next;
    }, 2000);

    return () => clearInterval(id);
  }, [symbol, timeframe, variant, theme]);

  return (
    <div
      ref={ref}
      data-chart-root
      className={variant === "expanded" ? "h-full w-full" : "h-full w-full"}
      style={variant === "expanded" ? { background: "var(--background)" } : undefined}
    />
  );
}
