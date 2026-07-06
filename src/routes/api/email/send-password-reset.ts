import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { deliverPasswordResetEmail } from "@/server/email-actions";
import { isValidEmail, jsonResponse, normalizeEmail } from "@/server/email-utils";

export const Route = createFileRoute("/api/email/send-password-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          let body: { email?: string };
          try {
            body = (await request.json()) as { email?: string };
          } catch {
            return jsonResponse({ error: "Invalid request body." }, 400);
          }

          const email = normalizeEmail(body.email ?? "");
          if (!isValidEmail(email)) {
            return jsonResponse({ error: "Enter a valid email address." }, 400);
          }

          await deliverPasswordResetEmail(email);
          return jsonResponse({ message: "Password reset email sent." });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("send-password-reset error:", err);
          const message = err instanceof Error ? err.message : "Failed to send password reset email.";
          return jsonResponse({ error: message }, 500);
        }
      },
    },
  },
});
