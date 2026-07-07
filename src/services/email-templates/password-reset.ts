import { primaryButton, signOffBlock, wrapEmailTemplate } from "@/services/email-templates/base";

export function passwordResetEmailHtml(resetLink: string): string {
  const body = `
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111111;"><strong>Dear Valued Client,</strong></p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111111;">
      We received a request to reset the password for your <strong>Exness India</strong> account.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#111111;">
      Click the button below to choose a new password. This link expires in 1 hour.
    </p>
    ${primaryButton(resetLink, "Reset Password")}
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#555555;word-break:break-all;">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${resetLink}" style="color:#111111;text-decoration:underline;">${resetLink}</a>
    </p>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#111111;">
      If you did not request a password reset, please contact our Customer Experience team immediately.
    </p>
    ${signOffBlock()}`;

  return wrapEmailTemplate("Reset your password — Exness India", body);
}
