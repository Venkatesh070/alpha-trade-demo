import { createFileRoute } from "@tanstack/react-router";
import { COMPETITIONS } from "@/data/content";
import { AdminCrud } from "@/components/admin/admin-crud-placeholder";
export const Route = createFileRoute("/admin/competitions")({
  component: () => <AdminCrud title="Competitions" items={COMPETITIONS.map((c) => c.name)} />,
});
