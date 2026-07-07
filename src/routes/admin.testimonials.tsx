import { createFileRoute } from "@tanstack/react-router";
import { TESTIMONIALS } from "@/data/content";
import { AdminCrud } from "@/components/admin/admin-crud-placeholder";
export const Route = createFileRoute("/admin/testimonials")({
  component: () => (
    <AdminCrud
      title="Testimonials"
      items={TESTIMONIALS.map((t) => `${t.name} — ${t.quote.slice(0, 60)}…`)}
    />
  ),
});
