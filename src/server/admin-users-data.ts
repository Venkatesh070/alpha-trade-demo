import { getDatabase } from "@/server/db/client";
import type { AdminUserRow, AdminUsersData } from "@/lib/admin-api";

function formatJoined(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function getLocalAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<AdminUsersData> {
  const db = await getDatabase();
  const page = Math.max(1, params?.page ?? 1);
  const limit = Math.min(100, Math.max(1, params?.limit ?? 50));
  const search = params?.search?.trim().toLowerCase() ?? "";

  const rows = await db.query<{
    user_email: string;
    created_at: number;
    updated_at: number;
  }>(
    `SELECT user_email, MIN(created_at) AS created_at, MAX(updated_at) AS updated_at
     FROM app_sessions
     WHERE session_type = 'user' AND user_email IS NOT NULL
     GROUP BY user_email
     ORDER BY created_at DESC`,
  );

  let users: AdminUserRow[] = rows.map((row, index) => {
    const email = row.user_email;
    const localPart = email.split("@")[0] ?? "User";
    const name = localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return {
      id: String(index + 1).padStart(3, "0"),
      userId: email,
      accountId: null,
      name: name || "User",
      email,
      status: "Active",
      balance: 0,
      joined: formatJoined(row.created_at),
      joinedAt: row.created_at,
    };
  });

  if (search) {
    users = users.filter(
      (user) =>
        user.email.toLowerCase().includes(search) ||
        user.name.toLowerCase().includes(search),
    );
  }

  const total = users.length;
  const start = (page - 1) * limit;

  return {
    users: users.slice(start, start + limit),
    total,
    page,
    limit,
  };
}
