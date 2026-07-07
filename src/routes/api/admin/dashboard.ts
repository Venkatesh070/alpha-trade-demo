import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { proxyAdminRequest, requireAdminSession } from "@/server/admin-auth";
import { jsonResponse } from "@/server/http-utils";

export const Route = createFileRoute("/api/admin/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdminSession(request);

          const proxied = await proxyAdminRequest(request, "/api/admin/dashboard");
          if (proxied) return proxied;

          return jsonResponse({ error: "Admin API unavailable. Set VITE_API_URL." }, 503);
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("admin/dashboard error:", err);
          return jsonResponse({ error: "Failed to load admin dashboard." }, 500);
        }
      },
    },
  },
});
