import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "./admin.news";
export const Route = createFileRoute("/admin/referrals")({
  component: () => (
    <AdminCrud
      title="Referral campaigns"
      items={["Default 10% lifetime", "Diwali special 15%", "First-deposit bonus"]}
    />
  ),
});
