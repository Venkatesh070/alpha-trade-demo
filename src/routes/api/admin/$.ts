import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { proxyAdminRequest, requireAdminSession } from "@/server/admin-auth";
import { jsonResponse } from "@/server/email-utils";

function localAdminFallback(path: string, method: string): Response {
  if (method !== "GET") {
    return jsonResponse({ error: "Admin action is not available offline." }, 501);
  }

  if (path.includes("/deposits/payment-settings")) {
    return jsonResponse({
      settings: {
        qrImage: null,
        upiId: "",
        accountName: "",
        updatedAt: Date.now(),
      },
    });
  }

  if (path.includes("/deposits/requests") || path.includes("/withdrawal-requests")) {
    return jsonResponse({ requests: [] });
  }

  if (path.includes("/news")) {
    return jsonResponse({ articles: [] });
  }

  return jsonResponse({ error: "Not found." }, 404);
}

export const Route = createFileRoute("/api/admin/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireAdminSession(request);

          const splat = params._splat ?? "";
          const path = `/api/admin/${splat}`;

          const proxied = await proxyAdminRequest(request, path);
          if (proxied?.ok) return proxied;

          return localAdminFallback(path, "GET");
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("admin proxy error:", err);
          return jsonResponse({ error: "Admin request failed." }, 500);
        }
      },
      POST: async ({ request, params }) => {
        try {
          await requireAdminSession(request);

          const splat = params._splat ?? "";
          const path = `/api/admin/${splat}`;

          const proxied = await proxyAdminRequest(request, path);
          if (proxied) return proxied;

          return localAdminFallback(path, "POST");
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Admin request failed." }, 500);
        }
      },
      PUT: async ({ request, params }) => {
        try {
          await requireAdminSession(request);

          const splat = params._splat ?? "";
          const path = `/api/admin/${splat}`;

          const proxied = await proxyAdminRequest(request, path);
          if (proxied) return proxied;

          return localAdminFallback(path, "PUT");
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Admin request failed." }, 500);
        }
      },
      DELETE: async ({ request, params }) => {
        try {
          await requireAdminSession(request);

          const splat = params._splat ?? "";
          const path = `/api/admin/${splat}`;

          const proxied = await proxyAdminRequest(request, path);
          if (proxied) return proxied;

          return localAdminFallback(path, "DELETE");
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Admin request failed." }, 500);
        }
      },
    },
  },
});
