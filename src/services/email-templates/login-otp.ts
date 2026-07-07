import { otpCodeBlock, signOffBlock, wrapEmailTemplate } from "@/services/email-templates/base";

export function loginOtpEmailHtml(code: string): string {
  const body = `
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111111;"><strong>Dear Valued Client,</strong></p>
    <p style="margin:0 0 4px;font-size:14px;line-height:1.6;color:#111111;">Your one-time verification code (OTP) is:</p>
    ${otpCodeBlock(code)}
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111111;">
      This code is valid for a single verification and has been sent to the email address associated with your <strong>Exness India</strong> account to ensure your account's security.
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111111;">
      Never share your verification code with anyone.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#111111;">
      If you did not request this code, please contact our Customer Experience team immediately.
    </p>
    ${signOffBlock()}`;

  return wrapEmailTemplate("Your one-time verification code — Exness India", body);
}
