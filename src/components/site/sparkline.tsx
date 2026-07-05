import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

function buildPath(points: number[], w: number, h: number) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(1, max - min);
  const step = w / (points.length - 1);

  const coords = points.map((v, i) => ({
    x: i * step,
    y: h - ((v - min) / span) * h,
  }));

  const d = coords
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  return { d, coords };
}

export function Sparkline({
  points,
  up = true,
  className,
  animated = false,
  showEndDot = false,
  showGrid = false,
}: {
  points: number[];
  up?: boolean;
  className?: string;
  animated?: boolean;
  showEndDot?: boolean;
  showGrid?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const w = 100;
  const h = 32;

  const { d, coords } = useMemo(() => buildPath(points, w, h), [points]);
  const color = up ? "var(--success)" : "var(--destructive)";
  const gradId = `sg-${uid}`;
  const last = coords[coords.length - 1];
  const endDot = animated || showEndDot;

  if (!points.length) return null;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-8 w-24 overflow-hidden", animated && "sparkline-animated", className)}
      preserveAspectRatio="none"
      shapeRendering="geometricPrecision"
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showGrid &&
        [0.25, 0.5, 0.75].map((y) => (
          <line
            key={y}
            x1="0"
            y1={h * y}
            x2={w}
            y2={h * y}
            className="sparkline-grid-line"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="0.25"
          />
        ))}

      <g className={animated ? "sparkline-chart" : undefined}>
        <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${gradId})`} />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={animated ? "0.7" : "1.2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {endDot && last && (
        <g className={animated ? "sparkline-end-marker" : undefined}>
          <circle cx={last.x} cy={last.y} r="1.2" fill={color} opacity={animated ? 0.35 : 0.25} />
          <circle
            cx={last.x}
            cy={last.y}
            r="0.55"
            fill={animated ? "white" : color}
            stroke={color}
            strokeWidth="0.15"
          />
        </g>
      )}
    </svg>
  );
}
