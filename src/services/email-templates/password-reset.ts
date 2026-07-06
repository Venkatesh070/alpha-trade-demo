import { primaryButton, wrapEmailTemplate } from "@/services/email-templates/base";

export function passwordResetEmailHtml(resetLink: string): string {
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#f5f5f5;">Reset your password</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#b0b0b0;">
      We received a request to reset the password for your Exness India account.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#b0b0b0;">
      Click the button below to choose a new password. This link expires in 1 hour.
    </p>
    ${primaryButton(resetLink, "Reset Password")}
    <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#666666;word-break:break-all;">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${resetLink}" style="color:#d4af37;text-decoration:underline;">${resetLink}</a>
    </p>
    <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#666666;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>`;

  return wrapEmailTemplate("Reset your password — Exness India", body);
}
