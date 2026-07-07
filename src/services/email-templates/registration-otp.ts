import { wrapEmailTemplate } from "@/services/email-templates/base";

export function registrationOtpEmailHtml(code: string): string {
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#f5f5f5;">Verify your email</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#b0b0b0;">
      Enter this 6-digit code to activate your Exness India account. It expires in 10 minutes.
    </p>
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#888888;">
      Verification code
    </p>
    <p style="margin:0 0 24px;font-size:36px;font-weight:700;letter-spacing:0.35em;color:#d4af37;font-family:monospace;">
      ${code}
    </p>
    <p style="margin:0;font-size:12px;line-height:1.6;color:#666666;">
      If you didn't create an account, you can safely ignore this email.
    </p>`;

  return wrapEmailTemplate("Verify your email — Exness India", body);
}
