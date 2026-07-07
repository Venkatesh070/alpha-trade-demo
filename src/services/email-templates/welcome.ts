import { primaryButton, signOffBlock, wrapEmailTemplate } from "@/services/email-templates/base";

export function welcomeEmailHtml(userName: string, appUrl: string): string {
  const displayName = userName.trim() || "Valued Client";
  const body = `
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111111;"><strong>Dear ${displayName},</strong></p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#111111;">
      Welcome to <strong>Exness India</strong>. Your email has been verified and your account is now active.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#111111;">
      You can now explore markets, manage your portfolio, and access our trading platform.
    </p>
    ${primaryButton(appUrl, "Go to Dashboard")}
    ${signOffBlock()}`;

  return wrapEmailTemplate("Welcome to Exness India", body);
}
