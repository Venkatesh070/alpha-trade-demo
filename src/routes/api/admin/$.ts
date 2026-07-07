import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { proxyAdminRequest, requireAdminSession } from "@/server/admin-auth";
import { jsonResponse } from "@/server/http-utils";

export const Route = createFileRoute("/api/admin/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireAdminSession(request);
          const path = `/api/admin/${params._splat ?? ""}`;
          const proxied = await proxyAdminRequest(request, path);
          if (proxied) return proxied;
          return jsonResponse({ error: "Admin API unavailable. Set VITE_API_URL." }, 503);
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Admin request failed." }, 500);
        }
      },
      POST: async ({ request, params }) => {
        try {
          await requireAdminSession(request);
          const path = `/api/admin/${params._splat ?? ""}`;
          const proxied = await proxyAdminRequest(request, path);
          if (proxied) return proxied;
          return jsonResponse({ error: "Admin API unavailable. Set VITE_API_URL." }, 503);
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Admin request failed." }, 500);
        }
      },
      PUT: async ({ request, params }) => {
        try {
          await requireAdminSession(request);
          const path = `/api/admin/${params._splat ?? ""}`;
          const proxied = await proxyAdminRequest(request, path);
          if (proxied) return proxied;
          return jsonResponse({ error: "Admin API unavailable. Set VITE_API_URL." }, 503);
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Admin request failed." }, 500);
        }
      },
      DELETE: async ({ request, params }) => {
        try {
          await requireAdminSession(request);
          const path = `/api/admin/${params._splat ?? ""}`;
          const proxied = await proxyAdminRequest(request, path);
          if (proxied) return proxied;
          return jsonResponse({ error: "Admin API unavailable. Set VITE_API_URL." }, 503);
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Admin request failed." }, 500);
        }
      },
    },
  },
});
