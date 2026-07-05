import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts";
import { randomId } from "@/lib/id";
import { cn } from "@/lib/utils";

export type DrawToolId =
  | "trend"
  | "horizontal"
  | "fibonacci"
  | "text"
  | "brush"
  | "marker"
  | "zoom";

export type Drawing =
  | { id: string; kind: "horizontal"; price: number }
  | { id: string; kind: "trend"; t1: number; p1: number; t2: number; p2: number }
  | { id: string; kind: "marker"; t: number; p: number }
  | { id: string; kind: "fibonacci"; t1: number; p1: number; t2: number; p2: number }
  | { id: string; kind: "text"; t: number; p: number; text: string }
  | { id: string; kind: "brush"; points: { t: number; p: number }[] };

type ChartRefs = {
  chart: IChartApi;
  series: ISeriesApi<"Candlestick">;
};

type ChartDrawingContextValue = {
  activeTool: DrawToolId | null;
  setActiveTool: (tool: DrawToolId | null) => void;
  toggleTool: (tool: DrawToolId) => void;
  drawings: Drawing[];
  addDrawing: (drawing: Drawing) => void;
  clearDrawings: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  registerChart: (refs: ChartRefs) => void;
  unregisterChart: () => void;
  getChartRefs: () => ChartRefs | null;
};

const ChartDrawingContext = createContext<ChartDrawingContextValue | null>(null);

export function useChartDrawing() {
  const ctx = useContext(ChartDrawingContext);
  return ctx;
}

export function ChartDrawingProvider({ children }: { children: ReactNode }) {
  const [activeTool, setActiveTool] = useState<DrawToolId | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [undoStack, setUndoStack] = useState<Drawing[][]>([]);
  const [redoStack, setRedoStack] = useState<Drawing[][]>([]);
  const chartRefs = useRef<ChartRefs | null>(null);

  const registerChart = useCallback((refs: ChartRefs) => {
    chartRefs.current = refs;
  }, []);

  const unregisterChart = useCallback(() => {
    chartRefs.current = null;
  }, []);

  const getChartRefs = useCallback(() => chartRefs.current, []);

  const addDrawing = useCallback((drawing: Drawing) => {
    setDrawings((prev) => {
      setUndoStack((s) => [...s, prev]);
      setRedoStack([]);
      return [...prev, drawing];
    });
  }, []);

  const clearDrawings = useCallback(() => {
    setDrawings((prev) => {
      if (prev.length === 0) return prev;
      setUndoStack((s) => [...s, prev]);
      setRedoStack([]);
      return [];
    });
  }, []);

  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const previous = stack[stack.length - 1]!;
      setDrawings((current) => {
        setRedoStack((r) => [...r, current]);
        return previous;
      });
      return stack.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const next = stack[stack.length - 1]!;
      setDrawings((current) => {
        setUndoStack((u) => [...u, current]);
        return next;
      });
      return stack.slice(0, -1);
    });
  }, []);

  const toggleTool = useCallback((tool: DrawToolId) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  }, []);

  const value = useMemo(
    () => ({
      activeTool,
      setActiveTool,
      toggleTool,
      drawings,
      addDrawing,
      clearDrawings,
      undo,
      redo,
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
      registerChart,
      unregisterChart,
      getChartRefs,
    }),
    [
      activeTool,
      toggleTool,
      drawings,
      addDrawing,
      clearDrawings,
      undo,
      redo,
      undoStack.length,
      redoStack.length,
      registerChart,
      unregisterChart,
      getChartRefs,
    ],
  );

  return <ChartDrawingContext.Provider value={value}>{children}</ChartDrawingContext.Provider>;
}

function toPoint(
  refs: ChartRefs,
  x: number,
  y: number,
): { t: number; p: number } | null {
  const time = refs.chart.timeScale().coordinateToTime(x);
  const price = refs.series.coordinateToPrice(y);
  if (time == null || price == null) return null;
  return { t: time as number, p: price };
}

function toCoords(refs: ChartRefs, t: number, p: number): { x: number; y: number } | null {
  const x = refs.chart.timeScale().timeToCoordinate(t as Time);
  const y = refs.series.priceToCoordinate(p);
  if (x == null || y == null) return null;
  return { x, y };
}

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

export function ChartDrawingOverlay() {
  const ctx = useChartDrawing();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<
    | { kind: "trend"; t1: number; p1: number; x2: number; y2: number }
    | { kind: "fibonacci"; t1: number; p1: number; t2: number; p2: number }
    | { kind: "brush"; points: { t: number; p: number }[] }
    | null
  >(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!ctx) return;
    const chart = ctx.getChartRefs()?.chart;
    if (!chart) return;

    const redraw = () => setTick((n) => n + 1);
    chart.timeScale().subscribeVisibleLogicalRangeChange(redraw);
    return () => chart.timeScale().unsubscribeVisibleLogicalRangeChange(redraw);
  }, [ctx, ctx?.drawings.length]);

  if (!ctx) return null;

  const { activeTool, addDrawing, drawings, getChartRefs } = ctx;
  const interactive = activeTool != null && activeTool !== "zoom";
  const api = getChartRefs();

  const handlePointerDown = (e: React.PointerEvent) => {
    const overlay = overlayRef.current;
    if (!overlay || !interactive || !api) return;

    const rect = overlay.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = toPoint(api, x, y);
    if (!point) return;

    if (activeTool === "horizontal") {
      addDrawing({ id: randomId(), kind: "horizontal", price: point.p });
      return;
    }

    if (activeTool === "marker") {
      addDrawing({ id: randomId(), kind: "marker", t: point.t, p: point.p });
      return;
    }

    if (activeTool === "text") {
      const text = window.prompt("Label", "Note");
      if (text?.trim()) {
        addDrawing({ id: randomId(), kind: "text", t: point.t, p: point.p, text: text.trim() });
      }
      return;
    }

    if (activeTool === "trend") {
      setDraft({ kind: "trend", t1: point.t, p1: point.p, x2: x, y2: y });
      overlay.setPointerCapture(e.pointerId);
      return;
    }

    if (activeTool === "fibonacci") {
      if (draft?.kind === "fibonacci") {
        addDrawing({
          id: randomId(),
          kind: "fibonacci",
          t1: draft.t1,
          p1: draft.p1,
          t2: point.t,
          p2: point.p,
        });
        setDraft(null);
      } else {
        setDraft({ kind: "fibonacci", t1: point.t, p1: point.p, t2: point.t, p2: point.p });
      }
      return;
    }

    if (activeTool === "brush") {
      setDraft({ kind: "brush", points: [point] });
      overlay.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draft || !overlayRef.current || !api) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draft.kind === "trend") {
      setDraft({ ...draft, x2: x, y2: y });
      return;
    }

    if (draft.kind === "brush") {
      const point = toPoint(api, x, y);
      if (!point) return;
      setDraft({ kind: "brush", points: [...draft.points, point] });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draft || !overlayRef.current || !api) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draft.kind === "trend") {
      const end = toPoint(api, x, y);
      if (end) {
        addDrawing({
          id: randomId(),
          kind: "trend",
          t1: draft.t1,
          p1: draft.p1,
          t2: end.t,
          p2: end.p,
        });
      }
      setDraft(null);
      overlayRef.current.releasePointerCapture(e.pointerId);
      return;
    }

    if (draft.kind === "brush" && draft.points.length > 1) {
      addDrawing({ id: randomId(), kind: "brush", points: draft.points });
      setDraft(null);
      overlayRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <>
      <div
        ref={overlayRef}
        className={cn(
          "absolute inset-0 z-20",
          interactive ? "cursor-crosshair" : "pointer-events-none",
          activeTool === "zoom" && "pointer-events-none",
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {api && (
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full">
          {drawings.map((d) => renderDrawing(api, d))}
          {draft?.kind === "trend" && (
            <line
              x1={toCoords(api, draft.t1, draft.p1)?.x ?? 0}
              y1={toCoords(api, draft.t1, draft.p1)?.y ?? 0}
              x2={draft.x2}
              y2={draft.y2}
              stroke="var(--gold)"
              strokeWidth={1.5}
            />
          )}
          {draft?.kind === "fibonacci" && (
            <>
              {renderFib(api, draft.t1, draft.p1, draft.t2, draft.p2, true)}
            </>
          )}
          {draft?.kind === "brush" && draft.points.length > 1 && (
            <polyline
              fill="none"
              stroke="var(--gold)"
              strokeWidth={1.5}
              points={draft.points
                .map((pt) => {
                  const c = toCoords(api, pt.t, pt.p);
                  return c ? `${c.x},${c.y}` : "";
                })
                .filter(Boolean)
                .join(" ")}
            />
          )}
        </svg>
      )}
    </>
  );
}

function renderDrawing(refs: ChartRefs, d: Drawing) {
  switch (d.kind) {
    case "trend": {
      const a = toCoords(refs, d.t1, d.p1);
      const b = toCoords(refs, d.t2, d.p2);
      if (!a || !b) return null;
      return (
        <line
          key={d.id}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke="var(--gold)"
          strokeWidth={1.5}
        />
      );
    }
    case "marker": {
      const c = toCoords(refs, d.t, d.p);
      if (!c) return null;
      return <circle key={d.id} cx={c.x} cy={c.y} r={4} fill="var(--gold)" />;
    }
    case "fibonacci":
      return (
        <g key={d.id}>{renderFib(refs, d.t1, d.p1, d.t2, d.p2, false)}</g>
      );
    case "text": {
      const c = toCoords(refs, d.t, d.p);
      if (!c) return null;
      return (
        <text key={d.id} x={c.x + 6} y={c.y - 6} fill="var(--gold)" fontSize={11}>
          {d.text}
        </text>
      );
    }
    case "brush":
      return (
        <polyline
          key={d.id}
          fill="none"
          stroke="var(--gold)"
          strokeWidth={1.5}
          points={d.points
            .map((pt) => {
              const c = toCoords(refs, pt.t, pt.p);
              return c ? `${c.x},${c.y}` : "";
            })
            .filter(Boolean)
            .join(" ")}
        />
      );
    default:
      return null;
  }
}

function renderFib(
  refs: ChartRefs,
  t1: number,
  p1: number,
  t2: number,
  p2: number,
  dashed: boolean,
) {
  const low = Math.min(p1, p2);
  const high = Math.max(p1, p2);
  const left = Math.min(t1, t2);
  const right = Math.max(t1, t2);
  const x1 = toCoords(refs, left, low)?.x;
  const x2 = toCoords(refs, right, high)?.x;
  if (x1 == null || x2 == null) return null;

  return FIB_LEVELS.map((level) => {
    const price = high - (high - low) * level;
    const y = refs.series.priceToCoordinate(price);
    if (y == null) return null;
    return (
      <g key={level}>
        <line
          x1={Math.min(x1, x2)}
          y1={y}
          x2={Math.max(x1, x2)}
          y2={y}
          stroke="rgba(255,209,12,0.55)"
          strokeWidth={1}
          strokeDasharray={dashed ? "4 4" : undefined}
        />
        <text x={Math.max(x1, x2) + 4} y={y + 4} fill="rgba(255,209,12,0.8)" fontSize={10}>
          {(level * 100).toFixed(1)}%
        </text>
      </g>
    );
  });
}

/** Sync horizontal drawing lines onto the candlestick series. */
export function useChartDrawingLines(
  chartRef: React.RefObject<IChartApi | null>,
  seriesRef: React.RefObject<ISeriesApi<"Candlestick"> | null>,
) {
  const ctx = useChartDrawing();
  const priceLineRefs = useRef<Map<string, ReturnType<ISeriesApi<"Candlestick">["createPriceLine"]>>>(
    new Map(),
  );

  useEffect(() => {
    const series = seriesRef.current;
    if (!series || !ctx) return;

    const horizontals = ctx.drawings.filter((d) => d.kind === "horizontal");
    const ids = new Set(horizontals.map((d) => d.id));

    for (const [id, line] of priceLineRefs.current) {
      if (!ids.has(id)) {
        series.removePriceLine(line);
        priceLineRefs.current.delete(id);
      }
    }

    for (const d of horizontals) {
      if (d.kind !== "horizontal") continue;
      const existing = priceLineRefs.current.get(d.id);
      if (existing) {
        existing.applyOptions({ price: d.price });
      } else {
        const line = series.createPriceLine({
          price: d.price,
          color: "#FFD10C",
          lineWidth: 1,
          lineStyle: 0,
          axisLabelVisible: true,
          title: "",
        });
        priceLineRefs.current.set(d.id, line);
      }
    }
  }, [ctx?.drawings, seriesRef, ctx]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !ctx) return;

    const allowPan = ctx.activeTool == null || ctx.activeTool === "zoom";
    chart.applyOptions({
      handleScroll: allowPan,
      handleScale: allowPan,
    });
  }, [ctx?.activeTool, chartRef, ctx]);
}
