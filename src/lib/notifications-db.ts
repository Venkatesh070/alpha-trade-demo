import { NOTIFICATIONS, type AppNotification } from "@/data/content";
import { randomId } from "@/lib/id";

export const NOTIFICATIONS_STORAGE_KEY = "exness-notifications";

export type NotificationInput = Pick<AppNotification, "type" | "title" | "body">;

export interface StoredNotification extends AppNotification {
  createdAt: number;
}

type NotificationsDb = Record<string, StoredNotification[]>;

function parseTimeToMs(time: string): number {
  const now = Date.now();
  if (time === "Just now") return now;
  const min = time.match(/^(\d+)m ago$/);
  if (min) return now - Number(min[1]) * 60_000;
  const hr = time.match(/^(\d+)h ago$/);
  if (hr) return now - Number(hr[1]) * 3_600_000;
  if (time === "Yesterday") return now - 86_400_000;
  const days = time.match(/^(\d+)d ago$/);
  if (days) return now - Number(days[1]) * 86_400_000;
  return now;
}

function seedNotifications(): StoredNotification[] {
  return NOTIFICATIONS.map((n) => ({
    ...n,
    createdAt: parseTimeToMs(n.time),
  }));
}

export function loadNotificationsDb(): NotificationsDb {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveNotificationsDb(db: NotificationsDb) {
  window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("exness-notifications-updated"));
}

export function getNotifications(email: string): StoredNotification[] {
  const db = loadNotificationsDb();
  if (!db[email]?.length) {
    const seeded = seedNotifications();
    db[email] = seeded;
    saveNotificationsDb(db);
    return seeded;
  }
  return db[email];
}

export function pushNotification(email: string, input: NotificationInput): StoredNotification {
  const db = loadNotificationsDb();
  const entry: StoredNotification = {
    id: randomId(),
    type: input.type,
    title: input.title,
    body: input.body,
    time: "Just now",
    read: false,
    createdAt: Date.now(),
  };
  const list = db[email] ?? [];
  db[email] = [entry, ...list];
  saveNotificationsDb(db);
  return entry;
}

export function markAllNotificationsRead(email: string) {
  const db = loadNotificationsDb();
  const list = db[email];
  if (!list?.length) return;
  db[email] = list.map((n) => ({ ...n, read: true }));
  saveNotificationsDb(db);
}

export function formatNotificationTime(createdAt: number): string {
  const diff = Date.now() - createdAt;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export const DRIP_NOTIFICATIONS: NotificationInput[] = [
  {
    type: "promo",
    title: "Monsoon Trader Cup is live",
    body: "Compete for a ₹10L prize pool.",
  },
  {
    type: "system",
    title: "Platform maintenance complete",
    body: "Latency improvements rolled out.",
  },
  {
    type: "promo",
    title: "Weekend spread rebate",
    body: "Trade majors with reduced spreads this Saturday.",
  },
  {
    type: "system",
    title: "New chart indicators",
    body: "Bollinger Bands and RSI are now on the terminal.",
  },
];
