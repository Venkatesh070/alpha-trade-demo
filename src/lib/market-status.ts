import type { Asset } from "@/data/markets";

export type MarketStatus = {
  open: boolean;
  label: string;
  reopensAt?: Date;
};

export function getMarketStatus(asset: Asset): MarketStatus {
  const now = new Date();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  if (asset.category === "crypto") {
    return { open: true, label: "Market Open" };
  }

  if (isWeekend && ["forex", "indices", "stocks", "energy"].includes(asset.category)) {
    const reopens = new Date(now);
    const daysUntilMonday = day === 0 ? 1 : 2;
    reopens.setDate(reopens.getDate() + daysUntilMonday);
    reopens.setHours(2, 32, 0, 0);
    return { open: false, label: "Market Closed", reopensAt: reopens };
  }

  const hour = now.getHours();
  if (asset.category === "forex" && (hour < 5 || hour >= 23)) {
    const reopens = new Date(now);
    if (hour >= 23) reopens.setDate(reopens.getDate() + 1);
    reopens.setHours(5, 0, 0, 0);
    return { open: false, label: "Market Closed", reopensAt: reopens };
  }

  return { open: true, label: "Market Open" };
}

export function formatReopenCountdown(reopensAt: Date): string {
  const diff = Math.max(0, reopensAt.getTime() - Date.now());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

export function formatReopenDate(reopensAt: Date): string {
  const day = reopensAt.toLocaleString("en-GB", { day: "2-digit" });
  const month = reopensAt.toLocaleString("en-GB", { month: "short" });
  const time = reopensAt.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day} ${month}, ${time}`;
}

/** Panel format: "Jul 06, 03:32" */
export function formatReopenDatePanel(reopensAt: Date): string {
  const month = reopensAt.toLocaleString("en-US", { month: "short" });
  const day = reopensAt.toLocaleString("en-US", { day: "2-digit" });
  const time = reopensAt.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${month} ${day}, ${time}`;
}
