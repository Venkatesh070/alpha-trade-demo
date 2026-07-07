const BRAND = "Exness India";
const YEAR = new Date().getFullYear();

/** Inline SVG logo — red mark + wordmark on black header (XM-style). */
function headerLogoHtml(): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
  <tr>
    <td style="vertical-align:middle;padding-right:10px;">
      <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="14,2 26,24 2,24" fill="#E02020"/>
      </svg>
    </td>
    <td style="vertical-align:middle;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:0.02em;font-family:Arial,Helvetica,sans-serif;">
      ${BRAND.split(" ")[0]}<span style="font-weight:400;"> ${BRAND.split(" ").slice(1).join(" ")}</span>
    </td>
  </tr>
</table>`;
}

function supportSectionHtml(): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:32px;border-top:1px solid #e5e5e5;">
  <tr>
    <td style="padding:28px 24px 8px;text-align:center;">
      <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#111111;font-family:Arial,Helvetica,sans-serif;">Need assistance?</p>
      <p style="margin:0 0 20px;font-size:13px;line-height:1.6;color:#555555;font-family:Arial,Helvetica,sans-serif;">
        For any questions, check out our Help Center, or get in touch via email or live chat.
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
        <tr>
          <td style="padding:0 12px;">
            <div style="width:40px;height:40px;border:2px solid #E02020;border-radius:50%;line-height:36px;text-align:center;font-size:18px;color:#E02020;">✉</div>
          </td>
          <td style="padding:0 12px;">
            <div style="width:40px;height:40px;border:2px solid #E02020;border-radius:50%;line-height:36px;text-align:center;font-size:18px;color:#E02020;">🎧</div>
          </td>
          <td style="padding:0 12px;">
            <div style="width:40px;height:40px;border:2px solid #E02020;border-radius:50%;line-height:36px;text-align:center;font-size:18px;color:#E02020;">💬</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function socialSectionHtml(): string {
  const networks = ["f", "ig", "x", "yt", "in", "tk", "tg"];
  const icons = networks
    .map(
      (n) =>
        `<td style="padding:0 6px;"><div style="width:32px;height:32px;background:#9e9e9e;border-radius:50%;line-height:32px;text-align:center;font-size:11px;font-weight:700;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">${n}</div></td>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e5e5;">
  <tr>
    <td style="padding:20px 24px 28px;text-align:center;">
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
        <tr>${icons}</tr>
      </table>
    </td>
  </tr>
</table>`;
}

function legalFooterHtml(): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e5e5;">
  <tr>
    <td style="padding:24px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
      <p style="margin:0 0 12px;font-size:12px;line-height:1.6;color:#333333;">
        <strong>${BRAND}</strong> operates under the trading name <strong>${BRAND}</strong>.
      </p>
      <p style="margin:0 0 12px;font-size:12px;line-height:1.6;color:#333333;">
        <strong>Legal:</strong> ${BRAND} is a demo trading platform for educational purposes. Trading involves significant risk to your invested capital.
      </p>
      <p style="margin:0;font-size:12px;line-height:1.6;color:#333333;">
        <strong>Risk Warning:</strong> Forex and CFD trading involves significant risk to your invested capital.
      </p>
      <p style="margin:16px 0 0;font-size:10px;color:#999999;">&copy; ${YEAR} ${BRAND}. All rights reserved.</p>
    </td>
  </tr>
</table>`;
}

export function wrapEmailTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f2f2f2;padding:0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;">
          <tr>
            <td style="background-color:#000000;padding:20px 24px;text-align:center;">
              ${headerLogoHtml()}
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;font-family:Arial,Helvetica,sans-serif;color:#111111;text-align:left;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              ${supportSectionHtml()}
              ${socialSectionHtml()}
              ${legalFooterHtml()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** XM-style OTP code display — large plain number, no boxed highlight. */
export function otpCodeBlock(code: string): string {
  return `<p style="margin:8px 0 20px;font-size:28px;font-weight:700;letter-spacing:0.12em;color:#111111;font-family:Arial,Helvetica,sans-serif;">${code}</p>`;
}

export function primaryButton(href: string, label: string): string {
  return `<p style="margin:24px 0 0;">
    <a href="${href}" target="_blank" style="display:inline-block;padding:12px 28px;background-color:#000000;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">${label}</a>
  </p>`;
}

export function signOffBlock(): string {
  return `<p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#111111;">
    <strong>Kind Regards,</strong><br />
    <strong>The ${BRAND} Team</strong>
  </p>`;
}
