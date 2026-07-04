import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "./admin.news";
export const Route = createFileRoute("/admin/cms")({
  component: () => (
    <AdminCrud
      title="CMS pages"
      items={["Landing hero", "About", "Pricing", "Footer", "Education", "Contact"]}
    />
  ),
});
