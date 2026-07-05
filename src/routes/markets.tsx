import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Sparkline } from "@/components/site/sparkline";
import { ALL_ASSETS, ASSETS_BY_CATEGORY, type AssetCategory, sparklineFor } from "@/data/markets";
import { useLivePrices } from "@/hooks/use-live-prices";
import { GatedChange, GatedPriceText, PriceLockBanner, GatedChart } from "@/components/pricing/price-gate";
import { cn } from "@/lib/utils";

const TABS: { id: AssetCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "forex", label: "Forex" },
  { id: "crypto", label: "Crypto" },
  { id: "metals", label: "Metals" },
  { id: "indices", label: "Indices" },
  { id: "stocks", label: "Stocks" },
  { id: "energy", label: "Energy" },
];

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — Exness India" },
      {
        name: "description",
        content: "Live prices for forex, crypto, metals, indices, stocks and energy markets.",
      },
    ],
  }),
  component: MarketsPage,
});

function MarketsPage() {
  const [tab, setTab] = useState<AssetCategory | "all">("all");
  const [q, setQ] = useState("");
  const live = useLivePrices(2000);
  const navigate = useNavigate();

  const list = useMemo(() => {
    const base = tab === "all" ? ALL_ASSETS : ASSETS_BY_CATEGORY[tab];
    return base.filter((a) => (a.symbol + a.name).toLowerCase().includes(q.toLowerCase()));
  }, [tab, q]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="text-xs uppercase tracking-wider text-[color:var(--gold)]">Markets</div>
        <h1 className="mt-2 font-display text-4xl font-extrabold">
          Trade <span className="gold-text">200+ instruments</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Live demo prices, updated every two seconds. Click any symbol to open it in the terminal.
        </p>

        <PriceLockBanner className="mt-6" />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search asset"
              className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--gold)]/40"
            />
          </div>
          <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded px-3 py-1.5 text-xs font-medium",
                  tab === t.id
                    ? "bg-[color:var(--gold)] text-[color:var(--primary-foreground)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glossy mt-6 overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Change</th>
                  <th className="px-4 py-3 text-right">Spread</th>
                  <th className="px-4 py-3 text-right">Leverage</th>
                  <th className="px-4 py-3 text-right">Volume</th>
                  <th className="px-4 py-3">Chart</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {list.map((a) => {
                  const p = live[a.symbol];
                  const up = (p?.changePct ?? a.changePct) >= 0;
                  return (
                    <tr
                      key={a.symbol}
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate({ to: "/trading", search: { symbol: a.symbol } })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate({ to: "/trading", search: { symbol: a.symbol } });
                        }
                      }}
                      className="cursor-pointer border-t border-border/60 hover:bg-accent/40"
                    >
                      <td className="px-4 py-3 font-semibold">{a.symbol}</td>
                      <td className="px-4 py-3 font-sans text-muted-foreground">{a.name}</td>
                      <td className="px-4 py-3 text-right">
                        <GatedPriceText
                          asset={a}
                          price={p?.price ?? a.price}
                          className="text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <GatedChange changePct={p?.changePct ?? a.changePct} className="text-sm" />
                      </td>
                      <td className="px-4 py-3 text-right">{a.spread}</td>
                      <td className="px-4 py-3 text-right">1:{a.leverage}</td>
                      <td className="px-4 py-3 text-right">{a.volume}</td>
                      <td className="px-4 py-3">
                        <GatedChart className="w-24" showMessage>
                          <Sparkline points={sparklineFor(a.symbol)} up={up} className="h-8 w-24" />
                        </GatedChart>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
