import { useEffect, useState } from "react";
import { ALL_ASSETS, type Asset } from "@/data/markets";

/**
 * Returns a live-updating price map. Every 2s, each asset's price walks
 * by a small random delta and changePct adjusts accordingly.
 */
export function useLivePrices(intervalMs = 2000) {
  const [prices, setPrices] = useState<
    Record<string, { price: number; changePct: number; dir: 1 | -1 | 0 }>
  >(() => {
    const init: Record<string, { price: number; changePct: number; dir: 1 | -1 | 0 }> = {};
    for (const a of ALL_ASSETS) init[a.symbol] = { price: a.price, changePct: a.changePct, dir: 0 };
    return init;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next: typeof prev = {};
        for (const a of ALL_ASSETS) {
          const cur = prev[a.symbol] ?? { price: a.price, changePct: a.changePct, dir: 0 as const };
          const vol = a.category === "crypto" ? 0.0035 : a.category === "stocks" ? 0.002 : 0.0008;
          const delta = (Math.random() - 0.5) * 2 * vol * cur.price;
          const newPrice = Math.max(0.0001, cur.price + delta);
          const dir: 1 | -1 | 0 = delta > 0 ? 1 : delta < 0 ? -1 : 0;
          const drift = (newPrice / a.price - 1) * 100;
          next[a.symbol] = { price: newPrice, changePct: cur.changePct * 0.85 + drift * 0.15, dir };
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return prices;
}

export function formatPrice(asset: Pick<Asset, "price" | "category">, value: number) {
  if (asset.category === "crypto") {
    return value >= 100 ? value.toFixed(2) : value.toFixed(4);
  }
  if (asset.category === "forex") return value.toFixed(4);
  if (asset.category === "energy") return value.toFixed(3);
  return value.toFixed(2);
}
