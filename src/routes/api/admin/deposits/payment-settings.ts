import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { proxyAdminRequest, requireAdminSession } from "@/server/admin-auth";
import { jsonResponse } from "@/server/email-utils";

const EMPTY_SETTINGS = {
  settings: {
    qrImage: null,
    upiId: "",
    accountName: "",
    updatedAt: Date.now(),
  },
};

export const Route = createFileRoute("/api/admin/deposits/payment-settings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await requireAdminSession(request);

          const proxied = await proxyAdminRequest(request, "/api/admin/deposits/payment-settings");
          if (proxied?.ok) return proxied;

          return jsonResponse(EMPTY_SETTINGS);
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Failed to load payment settings." }, 500);
        }
      },
      PUT: async ({ request }) => {
        try {
          await requireAdminSession(request);

          const proxied = await proxyAdminRequest(request, "/api/admin/deposits/payment-settings");
          if (proxied && proxied.status < 500) return proxied;

          return jsonResponse({ error: "Payment settings are not available offline." }, 501);
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Failed to update payment settings." }, 500);
        }
      },
    },
  },
});
