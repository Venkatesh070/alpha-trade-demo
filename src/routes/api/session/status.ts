import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getUserSessionStatus } from "@/server/db/session-store";
import { jsonResponse, verifyBearerToken } from "@/server/email-utils";
import {
  getDeviceIdFromRequest,
  getUserSessionIdFromRequest,
  setUserSessionCookie,
  withSessionCookie,
} from "@/server/session-cookies";

export const Route = createFileRoute("/api/session/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { email } = await verifyBearerToken(request.headers.get("Authorization"));
          if (!email) {
            return jsonResponse({ error: "No email on this account." }, 400);
          }

          const deviceId = getDeviceIdFromRequest(request);
          if (!deviceId) {
            return jsonResponse({ error: "Missing device identifier." }, 400);
          }

          const sessionId = getUserSessionIdFromRequest(request);
          const status = await getUserSessionStatus(email, deviceId, sessionId);

          let response = jsonResponse({
            ...status,
            email,
          });

          if (status.sessionId && status.sessionId !== sessionId) {
            response = withSessionCookie(response, setUserSessionCookie(status.sessionId));
          }

          return response;
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("session/status error:", err);
          const message = err instanceof Error ? err.message : "Failed to read session.";
          return jsonResponse({ error: message }, 500);
        }
      },
    },
  },
});
