import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { deliverWelcomeEmail } from "@/server/email-actions";
import { jsonResponse, verifyBearerToken } from "@/server/email-utils";

export const Route = createFileRoute("/api/email/send-welcome")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { email } = await verifyBearerToken(request.headers.get("Authorization"));
          if (!email) {
            return jsonResponse({ error: "No email on this account." }, 400);
          }

          let body: { userName?: string } = {};
          try {
            const text = await request.text();
            if (text.trim()) {
              body = JSON.parse(text) as { userName?: string };
            }
          } catch {
            return jsonResponse({ error: "Invalid request body." }, 400);
          }

          await deliverWelcomeEmail(email, body.userName?.trim() || "Trader");
          return jsonResponse({ message: "Welcome email sent." });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("send-welcome error:", err);
          const message = err instanceof Error ? err.message : "Failed to send welcome email.";
          return jsonResponse({ error: message }, 500);
        }
      },
    },
  },
});
