import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

const USERS = Array.from({ length: 24 }, (_, i) => ({
  id: "u" + (1000 + i),
  name: ["Aarav Sharma","Diya Patel","Vihaan Reddy","Ananya Iyer","Ishaan Khanna","Saanvi Gupta","Arjun Rao","Myra Singh","Reyansh Joshi","Kiara Bose"][i % 10] + " " + (i + 1),
  email: `trader${i + 1}@example.in`,
  status: ["Active","Active","Active","Pending KYC","Suspended"][i % 5],
  balance: 50000 + (i * 12345) % 950000,
  joined: `Jun ${28 - (i % 28)}, 2026`,
}));

function AdminUsers() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="font-display text-2xl font-bold">Users</h1>
      <div className="glossy overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Balance</th><th className="px-4 py-3">Joined</th></tr></thead>
          <tbody className="font-mono">
            {USERS.map((u) => (
              <tr key={u.id} className="border-t border-border/60">
                <td className="px-4 py-2">{u.id}</td>
                <td className="px-4 py-2 font-sans">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 font-sans"><span className={"rounded px-2 py-0.5 text-xs " + (u.status === "Active" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : u.status === "Pending KYC" ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]" : "bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]")}>{u.status}</span></td>
                <td className="px-4 py-2 text-right">₹{u.balance.toLocaleString()}</td>
                <td className="px-4 py-2 font-sans text-muted-foreground">{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
