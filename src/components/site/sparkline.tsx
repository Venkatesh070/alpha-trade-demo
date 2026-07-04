import { useId } from "react";
import { cn } from "@/lib/utils";

export function Sparkline({
  points,
  up = true,
  className,
}: {
  points: number[];
  up?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  if (!points.length) return null;
  const w = 100;
  const h = 32;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(1, max - min);
  const step = w / (points.length - 1);
  const d = points
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"} ${(i * step).toFixed(2)} ${(h - ((v - min) / span) * h).toFixed(2)}`,
    )
    .join(" ");
  const color = up ? "var(--success)" : "var(--destructive)";
  const id = `sg-${uid}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-8 w-24", className)} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}
