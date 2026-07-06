import { primaryButton, wrapEmailTemplate } from "@/services/email-templates/base";

export function verificationEmailHtml(verificationLink: string): string {
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#f5f5f5;">Verify your email</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#b0b0b0;">
      Thanks for signing up with Exness India. Please confirm your email address to activate your account and start trading.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#b0b0b0;">
      Click the button below to verify your email. This link expires in 24 hours.
    </p>
    ${primaryButton(verificationLink, "Verify Email Address")}
    <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#666666;word-break:break-all;">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${verificationLink}" style="color:#d4af37;text-decoration:underline;">${verificationLink}</a>
    </p>
    <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#666666;">
      If you didn't create an account, you can safely ignore this email.
    </p>`;

  return wrapEmailTemplate("Verify your email — Exness India", body);
}
