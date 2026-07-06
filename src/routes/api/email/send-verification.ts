import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { deliverVerificationEmail } from "@/server/email-actions";
import { jsonResponse, verifyBearerToken } from "@/server/email-utils";

export const Route = createFileRoute("/api/email/send-verification")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { email } = await verifyBearerToken(request.headers.get("Authorization"));
          if (!email) {
            return jsonResponse({ error: "No email on this account." }, 400);
          }

          await deliverVerificationEmail(email);
          return jsonResponse({ message: "Verification email sent." });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("send-verification error:", err);
          const message = err instanceof Error ? err.message : "Failed to send verification email.";
          return jsonResponse({ error: message }, 500);
        }
      },
    },
  },
});
