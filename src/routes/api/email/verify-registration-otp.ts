import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { verifyRegistrationOtp } from "@/server/registration-otp";
import { getUserSessionStatus, upsertUserSessionAfterOtp } from "@/server/db/session-store";
import { jsonResponse, verifyBearerToken } from "@/server/email-utils";
import {
  getDeviceIdFromRequest,
  getUserSessionIdFromRequest,
  setUserSessionCookie,
  withSessionCookie,
} from "@/server/session-cookies";

export const Route = createFileRoute("/api/email/verify-registration-otp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { uid, email } = await verifyBearerToken(request.headers.get("Authorization"));
          if (!email) {
            return jsonResponse({ error: "No email on this account." }, 400);
          }

          const deviceId = getDeviceIdFromRequest(request);
          if (!deviceId) {
            return jsonResponse({ error: "Missing device identifier." }, 400);
          }

          const body = (await request.json()) as { code?: string; trustDevice?: boolean };
          const code = body.code?.trim();
          if (!code || !/^\d{6}$/.test(code)) {
            return jsonResponse({ error: "Enter the 6-digit code from your email." }, 400);
          }

          await verifyRegistrationOtp(uid, email, code);

          // Verifying the registration code also satisfies the sign-in OTP,
          // so a fresh account is logged in without a second code.
          const sessionId = getUserSessionIdFromRequest(request);
          const session = await upsertUserSessionAfterOtp({
            email,
            deviceId,
            sessionId,
            trustDevice: !!body.trustDevice,
          });

          const status = await getUserSessionStatus(email, deviceId, session.id);
          return withSessionCookie(
            jsonResponse({ message: "Email verified.", verified: true, ...status }),
            setUserSessionCookie(session.id),
          );
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
