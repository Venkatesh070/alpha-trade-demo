import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { verifyRegistrationOtp } from "@/server/registration-otp";
import { jsonResponse, verifyBearerToken } from "@/server/email-utils";

export const Route = createFileRoute("/api/email/verify-registration-otp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { uid, email } = await verifyBearerToken(request.headers.get("Authorization"));
          if (!email) {
            return jsonResponse({ error: "No email on this account." }, 400);
          }

          const body = (await request.json()) as { code?: string };
          const code = body.code?.trim();
          if (!code || !/^\d{6}$/.test(code)) {
            return jsonResponse({ error: "Enter the 6-digit code from your email." }, 400);
          }

          await verifyRegistrationOtp(uid, email, code);
          return jsonResponse({ message: "Email verified.", verified: true });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("verify-registration-otp error:", err);
          const message = err instanceof Error ? err.message : "Failed to verify code.";
          const status = message.includes("Incorrect") || message.includes("expired") ? 400 : 500;
          return jsonResponse({ error: message }, status);
        }
      },
    },
  },
});
