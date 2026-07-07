import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { proxyAdminRequest, requireAdminSession } from "@/server/admin-auth";
import { getLocalAdminDashboard } from "@/server/admin-dashboard-data";
import { jsonResponse } from "@/server/email-utils";

export const Route = createFileRoute("/api/admin/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdminSession(request);

          const proxied = await proxyAdminRequest(request, "/api/admin/dashboard");
          if (proxied?.ok) return proxied;

          const url = new URL(request.url);
          const days = Number(url.searchParams.get("days") ?? 60);
          const data = await getLocalAdminDashboard(Number.isFinite(days) ? days : 60);
          return jsonResponse(data);
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("admin/dashboard error:", err);
          return jsonResponse({ error: "Failed to load admin dashboard." }, 500);
        }
      },
    },
  },
});
