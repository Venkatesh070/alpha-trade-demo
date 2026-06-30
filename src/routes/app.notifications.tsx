import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CheckCircle2, CreditCard, ShieldCheck, Sparkles, Server } from "lucide-react";
import { NOTIFICATIONS, type AppNotification } from "@/data/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

const ICONS = { trade: CheckCircle2, deposit: CreditCard, verification: ShieldCheck, promo: Sparkles, system: Server } as const;

function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>(NOTIFICATIONS);
  const [tab, setTab] = useState<string>("all");

  const filtered = tab === "all" ? items : tab === "unread" ? items.filter((i) => !i.read) : items.filter((i) => i.type === tab);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        <button onClick={() => setItems((p) => p.map((x) => ({ ...x, read: true })))} className="text-xs text-[color:var(--gold)] hover:underline">Mark all read</button>
      </div>

      <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface p-1 text-xs">
        {["all", "unread", "trade", "deposit", "verification", "promo", "system"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded px-3 py-1.5 font-medium capitalize", tab === t ? "bg-[color:var(--gold)] text-[color:var(--primary-foreground)]" : "text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.length === 0 && <li className="rounded-2xl border border-border/60 p-8 text-center text-sm text-muted-foreground">All caught up.</li>}
        {filtered.map((n) => {
          const Icon = ICONS[n.type] ?? Bell;
          return (
            <li key={n.id} className={cn("glossy-soft flex gap-4 rounded-2xl p-4", !n.read && "ring-gold")}>
              <Icon className="mt-0.5 h-5 w-5 text-[color:var(--gold)]" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.time}</div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{n.body}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
