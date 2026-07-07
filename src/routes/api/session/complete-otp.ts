import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getUserSessionStatus, upsertUserSessionAfterOtp } from "@/server/db/session-store";
import { jsonResponse, verifyBearerToken } from "@/server/email-utils";
import {
  getDeviceIdFromRequest,
  getUserSessionIdFromRequest,
  setUserSessionCookie,
  withSessionCookie,
} from "@/server/session-cookies";

export const Route = createFileRoute("/api/session/complete-otp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { email } = await verifyBearerToken(request.headers.get("Authorization"));
          if (!email) {
            return jsonResponse({ error: "No email on this account." }, 400);
          }

          const deviceId = getDeviceIdFromRequest(request);
          if (!deviceId) {
            return jsonResponse({ error: "Missing device identifier." }, 400);
          }

          const body = (await request.json()) as { trustDevice?: boolean };
          const sessionId = getUserSessionIdFromRequest(request);
          const session = await upsertUserSessionAfterOtp({
            email,
            deviceId,
            sessionId,
            trustDevice: !!body.trustDevice,
          });

          const status = await getUserSessionStatus(email, deviceId, session.id);
          return withSessionCookie(
            jsonResponse({ message: "Session updated.", ...status }),
            setUserSessionCookie(session.id),
          );
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("session/complete-otp error:", err);
          const message = err instanceof Error ? err.message : "Failed to update session.";
          return jsonResponse({ error: message }, 500);
        }
      },
    },
  },
});
