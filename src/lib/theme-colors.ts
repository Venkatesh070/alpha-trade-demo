let canvasCtx: CanvasRenderingContext2D | null = null;

function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!canvasCtx) {
    const canvas = document.createElement("canvas");
    canvasCtx = canvas.getContext("2d");
  }
  return canvasCtx;
}

/** Force any CSS color (incl. oklch) to #rrggbb or rgba(...) via canvas parsing. */
export function toCanvasColor(color: string, fallback: string): string {
  const ctx = getCanvasCtx();
  if (!ctx || !color) return fallback;
  try {
    ctx.fillStyle = "#000000";
    ctx.fillStyle = color;
    const parsed = ctx.fillStyle;
    if (!parsed || parsed.startsWith("oklch")) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

/** Resolve a CSS custom property to a canvas-safe rgb/hex string. */
export function themeColor(name: `--${string}`, fallback = ""): string {
  return toCanvasColor(resolveCssVar(name, "color", fallback), fallback);
}

/** Resolve a CSS custom property as a canvas-safe background color. */
export function themeBackground(name: `--${string}`, fallback = ""): string {
  return toCanvasColor(resolveCssVar(name, "backgroundColor", fallback), fallback);
}

function resolveCssVar(
  name: `--${string}`,
  property: "color" | "backgroundColor",
  fallback: string,
): string {
  if (typeof document === "undefined") return fallback;

  const probe = document.createElement("span");
  probe.style.display = "none";
  probe.style[property] = `var(${name})`;
  document.documentElement.appendChild(probe);
  const resolved = getComputedStyle(probe)[property];
  probe.remove();

  if (!resolved || resolved === "rgba(0, 0, 0, 0)") return fallback;
  return resolved;
}

/** Apply alpha to an rgb/rgba/hex color string. */
export function withAlpha(color: string, alpha: number): string {
  const safe = toCanvasColor(color, color);

  const rgb = safe.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;

  const hex = safe.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (hex) {
    const r = parseInt(hex[1]!.slice(0, 2), 16);
    const g = parseInt(hex[1]!.slice(2, 4), 16);
    const b = parseInt(hex[1]!.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return safe;
}
