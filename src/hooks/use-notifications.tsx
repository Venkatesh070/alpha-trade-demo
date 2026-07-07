import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { AppNotification } from "@/data/content";
import { useAuth } from "@/hooks/use-auth";
import {
  DRIP_NOTIFICATIONS,
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

function NotificationToastBridge({ items }: { items: AppNotification[] }) {
  const seenRef = useRef<Set<string>>(new Set());
  const primedRef = useRef(false);

  useEffect(() => {
    if (!primedRef.current) {
      items.forEach((n) => seenRef.current.add(n.id));
      primedRef.current = true;
      return;
    }

    for (const n of items) {
      if (seenRef.current.has(n.id)) continue;
      seenRef.current.add(n.id);
      toastForNotification(n);
    }
  }, [items]);

  return null;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [stored, setStored] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const dripIndexRef = useRef(0);

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

  useEffect(() => {
    if (!user?.email) return;

    const id = window.setInterval(() => {
      const next = DRIP_NOTIFICATIONS[dripIndexRef.current % DRIP_NOTIFICATIONS.length];
      dripIndexRef.current += 1;
      pushNotification(user.email, next);
      refresh();
    }, 45_000);

    return () => window.clearInterval(id);
  }, [refresh, user?.email]);

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
      <NotificationToastBridge items={items} />
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
