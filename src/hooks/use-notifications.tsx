import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { AppNotification } from "@/data/content";
import { useAuth } from "@/hooks/use-auth";
import {
  formatNotificationTime,
  getNotifications,
  markAllNotificationsRead,
  NOTIFICATIONS_STORAGE_KEY,
  pushNotification,
  type StoredNotification,
} from "@/lib/notifications-db";

interface NotificationCtx {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAllRead: () => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationCtx | null>(null);

function toDisplayItem(n: StoredNotification): AppNotification {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    read: n.read,
    time: formatNotificationTime(n.createdAt),
  };
}

function toastForNotification(n: Pick<AppNotification, "type" | "title" | "body">) {
  const opts = { description: n.body, duration: 5000 };
  switch (n.type) {
    case "trade":
    case "deposit":
    case "verification":
      toast.success(n.title, opts);
      break;
    case "promo":
      toast.message(n.title, opts);
      break;
    case "system":
    default:
      toast.info(n.title, opts);
      break;
  }
}

function NotificationToastBridge({
  stored,
  userEmail,
}: {
  stored: StoredNotification[];
  userEmail?: string;
}) {
  useEffect(() => {
    if (!userEmail) return;

    const seenKey = `exness-toasted-notifications:${userEmail}`;
    let seen: Set<string>;
    try {
      seen = new Set(JSON.parse(sessionStorage.getItem(seenKey) ?? "[]") as string[]);
    } catch {
      seen = new Set();
    }

    const now = Date.now();
    const TOAST_WINDOW_MS = 15_000;
    let changed = false;

    for (const n of stored) {
      if (seen.has(n.id)) continue;
      seen.add(n.id);
      changed = true;

      if (now - n.createdAt <= TOAST_WINDOW_MS) {
        toastForNotification(n);
      }
    }

    if (changed) {
      const trimmed = [...seen].slice(-200);
      sessionStorage.setItem(seenKey, JSON.stringify(trimmed));
    }
  }, [stored, userEmail]);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [stored, setStored] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!user?.email) {
      setStored([]);
      return;
    }
    setStored(getNotifications(user.email));
  }, [user?.email]);

  useEffect(() => {
    refresh();
    setLoading(false);
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key !== NOTIFICATIONS_STORAGE_KEY) return;
      refresh();
    };
    window.addEventListener("exness-notifications-updated", onUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("exness-notifications-updated", onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const markAllRead = useCallback(() => {
    if (!user?.email) return;
    markAllNotificationsRead(user.email);
    refresh();
  }, [refresh, user?.email]);

  const items = useMemo(() => stored.map(toDisplayItem), [stored]);
  const unreadCount = useMemo(() => stored.filter((n) => !n.read).length, [stored]);

  const value = useMemo<NotificationCtx>(
    () => ({ items, unreadCount, loading, markAllRead, refresh }),
    [items, unreadCount, loading, markAllRead, refresh],
  );

  return (
    <NotificationContext.Provider value={value}>
      <NotificationToastBridge stored={stored} userEmail={user?.email} />
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

export { pushNotification };
