import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, type IChartApi, type ISeriesApi, type Time } from "lightweight-charts";
import { generateCandles, getAsset } from "@/data/markets";

export function TradingChart({ symbol, timeframe }: { symbol: string; timeframe: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight,
      layout: {
        background: { color: "transparent" },
        textColor: "rgba(245,240,224,0.7)",
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)" },
      timeScale: { borderColor: "rgba(255,255,255,0.08)", timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: "rgba(250,204,21,0.4)", labelBackgroundColor: "#FACC15" }, horzLine: { color: "rgba(250,204,21,0.4)", labelBackgroundColor: "#FACC15" } },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      borderVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (!chartRef.current || !el) return;
      chartRef.current.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; seriesRef.current = null; };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    const asset = getAsset(symbol);
    const data = generateCandles(symbol + timeframe, 240, asset?.price ?? 100).map((c) => ({
      time: c.time as Time,
      open: c.open, high: c.high, low: c.low, close: c.close,
    }));
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();

    // Live tick simulation
    let last = data[data.length - 1];
    const id = setInterval(() => {
      if (!seriesRef.current || !last) return;
      const vol = (asset?.category === "crypto" ? 0.003 : 0.001) * last.close;
      const close = Math.max(0.0001, last.close + (Math.random() - 0.5) * 2 * vol);
      const next = {
        time: (last.time as number) + 60 * 15 as Time,
        open: last.close,
        high: Math.max(last.close, close),
        low: Math.min(last.close, close),
        close,
      };
      seriesRef.current.update(next);
      last = next;
    }, 2000);

    return () => clearInterval(id);
  }, [symbol, timeframe]);

  return <div ref={ref} className="h-full w-full" />;
}
