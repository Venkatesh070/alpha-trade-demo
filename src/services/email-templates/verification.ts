import { primaryButton, signOffBlock, wrapEmailTemplate } from "@/services/email-templates/base";

export function verificationEmailHtml(verificationLink: string): string {
  const body = `
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111111;"><strong>Dear Valued Client,</strong></p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111111;">
      Thank you for registering with <strong>Exness India</strong>. Please verify your email address to activate your account.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#111111;">
      Click the button below to confirm your email. This link expires in 24 hours.
    </p>
    ${primaryButton(verificationLink, "Verify Email Address")}
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#555555;word-break:break-all;">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${verificationLink}" style="color:#111111;text-decoration:underline;">${verificationLink}</a>
    </p>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#111111;">
      If you did not create an account, please contact our Customer Experience team immediately.
    </p>
    ${signOffBlock()}`;

  return wrapEmailTemplate("Verify your email — Exness India", body);
}
