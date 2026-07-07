import { getDatabase } from "@/server/db/client";

export interface AdminDashboardStats {
  totalUsers: number;
  activeToday: number;
  volume24h: number;
  deposits24h: number;
}

export interface DailyActivePoint {
  date: string;
  count: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  dailyActiveUsers: DailyActivePoint[];
}

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function getLocalAdminDashboard(days = 60): Promise<AdminDashboardData> {
  const db = await getDatabase();
  const todayMs = startOfTodayMs();
  const sinceMs = Date.now() - days * 24 * 60 * 60 * 1000;

  const totalRows = await db.query<{ count: number }>(
    `SELECT COUNT(DISTINCT user_email) AS count
     FROM app_sessions
     WHERE session_type = 'user' AND user_email IS NOT NULL`,
  );

  const activeRows = await db.query<{ count: number }>(
    `SELECT COUNT(DISTINCT user_email) AS count
     FROM app_sessions
     WHERE session_type = 'user' AND user_email IS NOT NULL AND updated_at >= ?`,
    [todayMs],
  );

  const dailyRows = await db.query<{ day: string; count: number }>(
    `SELECT DATE(FROM_UNIXTIME(updated_at / 1000)) AS day,
            COUNT(DISTINCT user_email) AS count
     FROM app_sessions
     WHERE session_type = 'user'
       AND user_email IS NOT NULL
       AND updated_at >= ?
     GROUP BY day
     ORDER BY day ASC`,
    [sinceMs],
  );

  return {
    stats: {
      totalUsers: Number(totalRows[0]?.count ?? 0),
      activeToday: Number(activeRows[0]?.count ?? 0),
      volume24h: 0,
      deposits24h: 0,
    },
    dailyActiveUsers: dailyRows.map((row) => ({
      date: String(row.day),
      count: Number(row.count),
    })),
  };
}
