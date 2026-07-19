import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'no-reply@attiz.in';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ──────────────────────────────────────────────────────────────────────────────
// HTML Email Template — Verification
// ──────────────────────────────────────────────────────────────────────────────
function buildVerificationEmailHtml(firstName: string, verifyUrl: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your ATTIZ account</title>
</head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:3px solid #111111;box-shadow:8px 8px 0 0 #111111;max-width:520px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#111111;padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#FFCB05;font-size:22px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;">
                    ATTIZ
                  </td>
                  <td align="right">
                    <span style="background:#FFCB05;color:#111111;font-size:9px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;padding:4px 10px;display:inline-block;">
                      EMAIL VERIFICATION
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="font-size:22px;font-weight:900;color:#111111;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 12px 0;border-bottom:3px solid #FFCB05;padding-bottom:12px;">
                Hey ${firstName}!
              </h1>
              <p style="font-size:14px;color:#444444;line-height:1.7;margin:16px 0 28px 0;">
                Thank you for creating an ATTIZ account. Please verify your email address
                to activate your account and start shopping.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td>
                    <a href="${verifyUrl}"
                       style="display:inline-block;background:#111111;color:#FFCB05;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;padding:14px 32px;border:3px solid #111111;box-shadow:4px 4px 0 0 #E63B2E;">
                      VERIFY EMAIL ADDRESS
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:11px;color:#999999;line-height:1.6;margin:0 0 24px 0;">
                This link expires in <strong>24 hours</strong>. If you did not create an ATTIZ account,
                you can safely ignore this email.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:2px solid #EEEEEE;margin:24px 0;" />

              <p style="font-size:10px;color:#BBBBBB;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px 0;">
                If the button above does not work, copy and paste this URL:
              </p>
              <p style="font-size:10px;color:#E63B2E;word-break:break-all;margin:0;">
                ${verifyUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F5F5F5;border-top:2px solid #EEEEEE;padding:16px 32px;text-align:center;">
              <p style="font-size:10px;color:#AAAAAA;margin:0;letter-spacing:0.1em;text-transform:uppercase;">
                &copy; ${year} ATTIZ. All rights reserved.
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

// ──────────────────────────────────────────────────────────────────────────────
// Email: Send Verification Email
// ──────────────────────────────────────────────────────────────────────────────
export async function sendVerificationEmail(
  toEmail: string,
  token: string,
  firstName: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: `ATTIZ <${FROM_EMAIL}>`,
    to: toEmail,
    subject: 'Verify your ATTIZ account email',
    html: buildVerificationEmailHtml(firstName, verifyUrl),
  });

  if (error) {
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }
}
