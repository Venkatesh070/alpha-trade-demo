import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { proxyAdminRequest, requireAdminSession } from "@/server/admin-auth";
import { getLocalAdminUsers } from "@/server/admin-users-data";
import { jsonResponse } from "@/server/email-utils";

export const Route = createFileRoute("/api/admin/users")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdminSession(request);

          const proxied = await proxyAdminRequest(request, "/api/admin/users");
          if (proxied?.ok) return proxied;

          const url = new URL(request.url);
          const page = Number(url.searchParams.get("page") ?? 1);
          const limit = Number(url.searchParams.get("limit") ?? 50);
          const search = url.searchParams.get("search") ?? undefined;
          const status = url.searchParams.get("status") ?? undefined;

          const data = await getLocalAdminUsers({
            page: Number.isFinite(page) ? page : 1,
            limit: Number.isFinite(limit) ? limit : 50,
            search,
          });

          if (status && status !== "all") {
            data.users = data.users.filter((user) => user.status === status);
            data.total = data.users.length;
          }

          return jsonResponse(data);
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("admin/users error:", err);
          return jsonResponse({ error: "Failed to load admin users." }, 500);
        }
      },
    },
  },
});
