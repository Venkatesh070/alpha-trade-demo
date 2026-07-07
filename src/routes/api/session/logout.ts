import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { deleteSessionById, deleteUserSessions } from "@/server/db/session-store";
import { jsonResponse, verifyBearerToken } from "@/server/email-utils";
import {
  clearUserSessionCookie,
  getDeviceIdFromRequest,
  getUserSessionIdFromRequest,
  withSessionCookie,
} from "@/server/session-cookies";

export const Route = createFileRoute("/api/session/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authHeader = request.headers.get("Authorization");
          let email: string | undefined;
          try {
            const verified = await verifyBearerToken(authHeader);
            email = verified.email;
          } catch {
            // allow logout with cookie only
          }

          const deviceId = getDeviceIdFromRequest(request);
          const sessionId = getUserSessionIdFromRequest(request);

          if (email && deviceId) {
            await deleteUserSessions(email, deviceId);
          } else if (sessionId) {
            await deleteSessionById(sessionId);
          }

          return withSessionCookie(jsonResponse({ message: "Signed out." }), clearUserSessionCookie());
        } catch (err) {
          if (err instanceof Response) return err;
          return withSessionCookie(jsonResponse({ message: "Signed out." }), clearUserSessionCookie());
        }
      },
    },
  },
});
