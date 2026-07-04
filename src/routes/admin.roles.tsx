import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/admin/roles")({ component: AdminRoles });

const ROLES = [
  { name: "Super Admin", perms: ["users:*", "markets:*", "cms:*", "system:*"] },
  { name: "Operator", perms: ["users:read", "users:edit", "markets:read", "cms:edit"] },
  { name: "Support", perms: ["users:read", "tickets:*"] },
  { name: "Marketing", perms: ["cms:edit", "blogs:*", "promos:*"] },
];

function AdminRoles() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="font-display text-2xl font-bold">Roles & permissions</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {ROLES.map((r) => (
          <div key={r.name} className="glossy rounded-2xl p-5">
            <h2 className="font-display text-lg font-bold">{r.name}</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {r.perms.map((p) => (
                <li key={p} className="flex items-center gap-2 font-mono text-xs">
                  <Check className="h-3.5 w-3.5 text-[color:var(--gold)]" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
