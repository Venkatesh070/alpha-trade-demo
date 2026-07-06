import { primaryButton, wrapEmailTemplate } from "@/services/email-templates/base";

export function welcomeEmailHtml(userName: string, appUrl: string): string {
  const displayName = userName.trim() || "Trader";
  const body = `
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#f5f5f5;">Welcome, ${displayName}!</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#b0b0b0;">
      Your email has been verified and your Exness India account is now active.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#b0b0b0;">
      Explore markets, manage your portfolio, and experience our premium demo trading platform.
    </p>
    ${primaryButton(appUrl, "Go to Dashboard")}
    <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#666666;">
      Need help getting started? Visit our Help Centre or contact support from your account settings.
    </p>`;

  return wrapEmailTemplate("Welcome to Exness India", body);
}
