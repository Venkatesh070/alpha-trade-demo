import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import {
  createAdminSession,
  deleteSessionById,
  getSessionById,
  touchAdminSession,
} from "@/server/db/session-store";
import { jsonResponse } from "@/server/email-utils";
import {
  clearAdminSessionCookie,
  getAdminSessionIdFromRequest,
  setAdminSessionCookie,
  withSessionCookie,
} from "@/server/session-cookies";

export const Route = createFileRoute("/api/session/admin")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const sessionId = getAdminSessionIdFromRequest(request);
          if (!sessionId) {
            return jsonResponse({ error: "No admin session." }, 401);
          }

          const session = await getSessionById(sessionId);
          if (!session || session.session_type !== "admin" || !session.payload_json) {
            return withSessionCookie(
              jsonResponse({ error: "Admin session expired." }, 401),
              clearAdminSessionCookie(),
            );
          }

          return jsonResponse({
            adminEmail: session.admin_email,
            payload: JSON.parse(session.payload_json),
          });
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Failed to restore admin session." }, 500);
        }
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            adminEmail?: string;
            payload?: unknown;
          };

          if (!body.adminEmail || body.payload === undefined) {
            return jsonResponse({ error: "Invalid admin session payload." }, 400);
          }

          const session = await createAdminSession({
            adminEmail: body.adminEmail,
            payload: body.payload,
          });

          return withSessionCookie(
            jsonResponse({ message: "Admin session created.", sessionId: session.id }),
            setAdminSessionCookie(session.id),
          );
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("session/admin POST error:", err);
          return jsonResponse({ error: "Failed to create admin session." }, 500);
        }
      },
      PUT: async ({ request }) => {
        try {
          const sessionId = getAdminSessionIdFromRequest(request);
          if (!sessionId) {
            return jsonResponse({ error: "No admin session." }, 401);
          }

          const body = (await request.json()) as { payload?: unknown };
          if (body.payload === undefined) {
            return jsonResponse({ error: "Invalid admin session payload." }, 400);
          }

          await touchAdminSession(sessionId, body.payload);
          return jsonResponse({ message: "Admin session updated." });
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Failed to update admin session." }, 500);
        }
      },
      DELETE: async ({ request }) => {
        try {
          const sessionId = getAdminSessionIdFromRequest(request);
          if (sessionId) {
            await deleteSessionById(sessionId);
          }
          return withSessionCookie(jsonResponse({ message: "Admin signed out." }), clearAdminSessionCookie());
        } catch (err) {
          if (err instanceof Response) return err;
          return withSessionCookie(jsonResponse({ message: "Admin signed out." }), clearAdminSessionCookie());
        }
      },
    },
  },
});
