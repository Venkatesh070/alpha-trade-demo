import { useState, type ReactNode } from "react";
import {
  Users2,
  Trophy,
  Gift,
  Store,
  Newspaper,
  BarChart3,
  Calendar,
  Sparkles,
  Calculator,
  Server,
  TrendingUp,
  ChevronLeft,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type TabId = "popular" | "rewards" | "tools" | "economic";

const TABS: { id: TabId; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "rewards", label: "Rewards" },
  { id: "tools", label: "Tools" },
  { id: "economic", label: "Economic" },
];

type ToolCard = { label: string; icon: typeof Users2; to?: string; onClick?: () => void };

const SECTIONS: Record<TabId, { title: string; items: ToolCard[] }[]> = {
  popular: [
    {
      title: "Popular",
      items: [
        { label: "Copy Trading", icon: Users2, to: "/app/copy-trading" },
        { label: "Competitions", icon: Trophy, to: "/app/competitions" },
      ],
    },
  ],
  rewards: [
    {
      title: "Rewards",
      items: [
        { label: "Refer a Friend", icon: Gift, to: "/app/referral" },
        { label: "Traders Club", icon: Sparkles, to: "/app/leaderboards" },
        { label: "Marketplace", icon: Store, to: "/app/wallet" },
      ],
    },
  ],
  tools: [
    {
      title: "Tools",
      items: [
        { label: "News", icon: Newspaper, to: "/app/notifications" },
        { label: "Analysis", icon: BarChart3, to: "/app/portfolio" },
        { label: "Economic Calendar", icon: Calendar, to: "/app/trading" },
        { label: "Trading Central", icon: Sparkles, to: "/app/trading" },
        { label: "Forex Calculator", icon: Calculator, to: "/app/trading" },
        { label: "VPS", icon: Server, to: "/app/settings" },
      ],
    },
  ],
  economic: [
    {
      title: "Economic",
      items: [
        { label: "Calendar", icon: Calendar, to: "/app/trading" },
        { label: "Market News", icon: Newspaper, to: "/app/notifications" },
        { label: "Analysis", icon: TrendingUp, to: "/app/portfolio" },
      ],
    },
  ],
};

function ToolCardButton({ item }: { item: ToolCard }) {
  const Icon = item.icon;
  const inner = (
    <>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--gold)]/12 ring-1 ring-[color:var(--gold)]/20">
        <Icon className="h-5 w-5 text-[color:var(--gold)]" />
      </span>
      <span className="text-center text-[11px] font-medium leading-tight text-foreground/90">
        {item.label}
      </span>
    </>
  );

  const className =
    "flex flex-col items-center gap-2.5 rounded-xl border border-border/40 bg-card/60 p-3 transition hover:border-[color:var(--gold)]/30 hover:bg-card";

  if (item.to) {
    return (
      <Link to={item.to as never} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={item.onClick} className={className}>
      {inner}
    </button>
  );
}

export function TradingToolsPanel({
  marketsPanel,
}: {
  marketsPanel?: ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("popular");
  const [showMarkets, setShowMarkets] = useState(false);

  if (showMarkets && marketsPanel) {
    return (
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-border/60 bg-surface">
        <button
          type="button"
          onClick={() => setShowMarkets(false)}
          className="flex items-center gap-1 border-b border-border/60 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to tools
        </button>
        <div className="min-h-0 flex-1 overflow-hidden">{marketsPanel}</div>
      </aside>
    );
  }

  const sections = SECTIONS[tab];

  return (
    <aside className="flex w-[260px] shrink-0 flex-col overflow-hidden border-r border-border/60 bg-surface">
      <div className="shrink-0 p-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[color:var(--emerald-ink)] via-[color:var(--surface-2)] to-[color:var(--surface)] p-3.5 ring-1 ring-border/50">
          <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[color:var(--gold)]/10 blur-2xl" />
          <p className="relative text-sm font-semibold leading-snug text-foreground">
            Refer friends, earn more
          </p>
          <p className="relative mt-1 text-[11px] text-muted-foreground">Earn ₹8,000 per referral</p>
          <Link
            to="/app/referral"
            className="relative mt-2.5 inline-flex rounded-full bg-[color:var(--gold)]/15 px-3 py-1 text-[11px] font-semibold text-[color:var(--gold)] ring-1 ring-[color:var(--gold)]/25 hover:bg-[color:var(--gold)]/25"
          >
            Learn more
          </Link>
        </div>
      </div>

      <div className="shrink-0 border-b border-border/40 px-3">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative px-2.5 py-2.5 text-[11px] font-medium transition-colors",
                tab === t.id
                  ? "text-[color:var(--gold)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-[color:var(--gold)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {sections.map((section) => (
          <div key={section.title} className="mb-3">
            <h3 className="mb-2.5 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {section.items.map((item) => (
                <ToolCardButton key={item.label} item={item} />
              ))}
              {tab === "tools" && marketsPanel && (
                <button
                  type="button"
                  onClick={() => setShowMarkets(true)}
                  className="flex flex-col items-center gap-2.5 rounded-xl border border-border/40 bg-card/60 p-3 transition hover:border-[color:var(--gold)]/30 hover:bg-card"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--gold)]/12 ring-1 ring-[color:var(--gold)]/20">
                    <TrendingUp className="h-5 w-5 text-[color:var(--gold)]" />
                  </span>
                  <span className="text-center text-[11px] font-medium leading-tight text-foreground/90">
                    Markets
                  </span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
