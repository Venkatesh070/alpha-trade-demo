import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getAdminAuth } from "@/server/firebase-admin";
import { createLoginOtp, getOtpResendSeconds } from "@/server/login-otp";
import { jsonResponse, verifyBearerToken } from "@/server/email-utils";
import { sendRegistrationOtpEmail } from "@/services/mail.service";

export const Route = createFileRoute("/api/email/send-registration-otp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { uid, email } = await verifyBearerToken(request.headers.get("Authorization"));
          if (!email) {
            return jsonResponse({ error: "No email on this account." }, 400);
          }

          const user = await getAdminAuth().getUser(uid);
          if (user.emailVerified) {
            return jsonResponse({ error: "Email is already verified." }, 400);
          }

          const { code, resendInSeconds } = await createLoginOtp(email);
          await sendRegistrationOtpEmail(email, code);
          return jsonResponse({ message: "Verification code sent.", resendInSeconds });
        } catch (err) {
          if (err instanceof Response) return err;
          console.error("send-registration-otp error:", err);
          const message = err instanceof Error ? err.message : "Failed to send verification code.";
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
          return jsonResponse({ resendInSeconds: await getOtpResendSeconds(email) });
        } catch (err) {
          if (err instanceof Response) return err;
          return jsonResponse({ error: "Failed to read resend timer." }, 500);
        }
      },
    },
  },
});
