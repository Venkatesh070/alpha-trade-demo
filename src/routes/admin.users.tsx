import { createFileRoute } from "@tanstack/react-router";
import { useAdminUsers } from "@/hooks/use-admin-users";
import type { AdminUserStatus } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function statusClass(status: AdminUserStatus): string {
  if (status === "Active") return "bg-[color:var(--success)]/15 text-[color:var(--success)]";
  if (status === "Pending KYC") return "bg-[color:var(--warning)]/15 text-[color:var(--warning)]";
  return "bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]";
}

function AdminUsers() {
  const { data, isLoading, isError } = useAdminUsers();
  const users = data?.users ?? [];

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Users</h1>
        {data && (
          <span className="text-sm text-muted-foreground">{data.total} total</span>
        )}
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load users. Check that you are signed in as admin.
        </div>
      )}

      <div className="glossy overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Balance</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Loading users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No users registered yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.userId} className="border-t border-border/60">
                  <td className="px-4 py-2">{u.id}</td>
                  <td className="px-4 py-2 font-sans">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 font-sans">
                    <span className={`rounded px-2 py-0.5 text-xs ${statusClass(u.status)}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">₹{u.balance.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-2 font-sans text-muted-foreground">{u.joined}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
