import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createLoginOtp, getOtpResendSeconds } from "@/server/login-otp";
import { jsonResponse, verifyBearerToken } from "@/server/email-utils";
import { sendLoginOtpEmail } from "@/services/mail.service";

export const Route = createFileRoute("/api/email/send-login-otp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { email } = await verifyBearerToken(request.headers.get("Authorization"));
          if (!email) {
            return jsonResponse({ error: "No email on this account." }, 400);
          }

          const { code, resendInSeconds } = createLoginOtp(email);
          await sendLoginOtpEmail(email, code);
          return jsonResponse({ message: "Sign-in code sent.", resendInSeconds });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("send-login-otp error:", err);
          const message = err instanceof Error ? err.message : "Failed to send sign-in code.";
          const status = message.includes("Please wait") ? 429 : 500;
          return jsonResponse({ error: message }, status);
        }
      },
      GET: async ({ request }) => {
        try {
          const { email } = await verifyBearerToken(request.headers.get("Authorization"));
          if (!email) {
            return jsonResponse({ error: "No email on this account." }, 400);
          }
          return jsonResponse({ resendInSeconds: getOtpResendSeconds(email) });
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Failed to read resend timer." }, 500);
        }
      },
    },
  },
});
