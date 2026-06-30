import { createFileRoute } from "@tanstack/react-router";
import { FAQS } from "@/data/content";
import { AdminCrud } from "./admin.news";
export const Route = createFileRoute("/admin/faqs")({ component: () => <AdminCrud title="FAQs" items={FAQS.map(f => f.q)} /> });
