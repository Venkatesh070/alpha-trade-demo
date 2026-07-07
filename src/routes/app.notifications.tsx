import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CheckCircle2, CreditCard, Inbox, ShieldCheck, Sparkles, Server } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { PageShell } from "@/components/dashboard/page-shell";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

const ICONS = {
  trade: CheckCircle2,
  deposit: CreditCard,
  verification: ShieldCheck,
  promo: Sparkles,
  system: Server,
} as const;

const TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "trade", label: "Trade" },
  { id: "deposit", label: "Deposit" },
  { id: "verification", label: "KYC" },
  { id: "promo", label: "Promo" },
  { id: "system", label: "System" },
];

function NotificationsPage() {
  const { items, unreadCount, markAllRead } = useNotifications();
  const [tab, setTab] = useState("all");

  const filtered =
    tab === "all"
      ? items
      : tab === "unread"
        ? items.filter((i) => !i.read)
        : items.filter((i) => i.type === tab);

  return (
    <PageShell
      eyebrow="Inbox"
      title="Notifications"
      description={
        unreadCount > 0
          ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
          : "You're all caught up."
      }
      width="md"
      actions={
        unreadCount > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs font-medium text-[color:var(--gold)] hover:underline"
          >
            Mark all read
          </button>
        ) : null
      }
    >
      <FilterTabs tabs={TABS} value={tab} onChange={setTab} />

      <ul className="space-y-2">
        {filtered.length === 0 && (
          <li className="glossy-soft rounded-2xl">
            <EmptyState
              icon={Inbox}
              title="All caught up"
              description="No notifications in this filter."
            />
          </li>
        )}
        {filtered.map((n) => {
          const Icon = ICONS[n.type] ?? Bell;
          return (
            <li
              key={n.id}
              className={cn(
                "glossy-soft flex gap-4 rounded-2xl p-4 transition-all",
                !n.read && "ring-1 ring-[color:var(--gold)]/40 bg-[color:var(--gold)]/[0.03]",
              )}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[color:var(--gold)]/10">
                <Icon className="h-5 w-5 text-[color:var(--gold)]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium leading-snug">{n.title}</div>
                  <div className="shrink-0 text-[11px] text-muted-foreground">{n.time}</div>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
