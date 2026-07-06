export function wrapEmailTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#111111;border:1px solid #2a2418;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 16px;text-align:center;border-bottom:1px solid #2a2418;">
              <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:0.04em;color:#d4af37;">EXNESS INDIA</p>
              <p style="margin:8px 0 0;font-size:12px;color:#8a8a8a;letter-spacing:0.08em;text-transform:uppercase;">Premium Trading Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #2a2418;text-align:center;">
              <p style="margin:0;font-size:11px;line-height:1.6;color:#666666;">
                &copy; ${new Date().getFullYear()} Exness India. All rights reserved.<br />
                This is an automated message — please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function primaryButton(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto 0;">
  <tr>
    <td style="border-radius:8px;background:linear-gradient(135deg,#d4af37 0%,#b8962e 100%);">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#0a0a0a;text-decoration:none;letter-spacing:0.02em;">${label}</a>
    </td>
  </tr>
</table>`;
}
