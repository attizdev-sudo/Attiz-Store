import { Resend } from 'resend';

const FROM_EMAIL = () => process.env.RESEND_FROM_EMAIL || 'no-reply@attiz.in';
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface OrderItemEmailData {
  title: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  image?: string | null;
}

export interface OrderConfirmationEmailParams {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  orderId: string;
  orderDate?: string;
  paymentMethod: string;
  paymentStatus: string;
  status?: string;
  shippingDetails: {
    recipientName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  items: OrderItemEmailData[];
  pricing: {
    subtotal: number;
    shippingCharge: number;
    discount?: number;
    tax?: number;
    totalPrice: number;
  };
}

/**
 * Builds the responsive, branded HTML email template for ATTIZ order confirmation.
 */
function buildOrderConfirmationEmailHtml(params: OrderConfirmationEmailParams): string {
  const {
    customerName,
    orderNumber,
    orderDate,
    paymentMethod,
    paymentStatus,
    shippingDetails,
    items,
    pricing,
  } = params;

  const year = new Date().getFullYear();
  const formattedDate = orderDate
    ? new Date(orderDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  const ordersUrl = `${APP_URL()}/orders`;

  const itemsHtml = items
    .map((item) => {
      const itemImg =
        item.image && item.image.startsWith('http')
          ? item.image
          : 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200';
      const variantInfo = [item.size ? `Size: <strong>${item.size}</strong>` : '', item.color ? `Color: <strong>${item.color}</strong>` : '']
        .filter(Boolean)
        .join(' &nbsp;|&nbsp; ');

      const lineTotal = item.price * item.quantity;

      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #ECEAE5;vertical-align:top;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="64" style="vertical-align:top;padding-right:14px;">
                  <img src="${itemImg}" alt="${item.title}" width="64" height="80" style="display:block;border:1px solid #111111;object-fit:cover;background:#FAF8F5;" />
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#111111;line-height:1.3;text-transform:uppercase;letter-spacing:0.02em;">
                    ${item.title}
                  </p>
                  ${variantInfo ? `<p style="margin:0 0 4px 0;font-size:11px;color:#666666;letter-spacing:0.04em;">${variantInfo}</p>` : ''}
                  <p style="margin:0;font-size:11px;color:#888888;">
                    Qty: <strong>${item.quantity}</strong> &times; ₹${item.price.toLocaleString('en-IN')}
                  </p>
                </td>
                <td align="right" style="vertical-align:top;white-space:nowrap;padding-left:12px;">
                  <span style="font-size:13px;font-weight:800;color:#111111;font-family:monospace;">
                    ₹${lineTotal.toLocaleString('en-IN')}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');

  const fullAddress = [
    shippingDetails.addressLine1,
    shippingDetails.addressLine2,
    `${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.postalCode}`,
    shippingDetails.country || 'India',
  ]
    .filter(Boolean)
    .join('<br/>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmed — ${orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border:3px solid #111111;box-shadow:6px 6px 0 0 #111111;max-width:580px;width:100%;text-align:left;">

          <!-- BRAND HEADER -->
          <tr>
            <td style="background:#111111;padding:22px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color:#FFCB05;font-size:24px;font-weight:900;letter-spacing:0.22em;text-transform:uppercase;font-family:monospace;">
                      ATTIZ
                    </span>
                    <span style="display:block;color:#888888;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-top:2px;">
                      STREETWEAR &bull; COUTURE &bull; CULTURE
                    </span>
                  </td>
                  <td align="right">
                    <span style="background:#22C55E;color:#ffffff;font-size:9px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;padding:5px 12px;border:1px solid #111111;display:inline-block;">
                      &check; ORDER CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO BANNER -->
          <tr>
            <td style="padding:28px 28px 20px 28px;background:#ffffff;">
              <h1 style="font-size:20px;font-weight:900;color:#111111;letter-spacing:0.04em;text-transform:uppercase;margin:0 0 10px 0;">
                Thanks for your order, ${customerName}!
              </h1>
              <p style="font-size:13px;color:#444444;line-height:1.6;margin:0 0 18px 0;">
                We have received your order <strong>${orderNumber}</strong> and it is now confirmed. We are prepping your items for dispatch.
              </p>

              <!-- ORDER METADATA BOX -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;border:2px solid #111111;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 16px;border-right:1px solid #ECEAE5;width:50%;vertical-align:top;">
                    <span style="font-size:9px;color:#777777;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:4px;font-weight:700;">Order Number</span>
                    <span style="font-size:13px;font-weight:900;color:#111111;font-family:monospace;letter-spacing:0.05em;">${orderNumber}</span>
                  </td>
                  <td style="padding:14px 16px;vertical-align:top;">
                    <span style="font-size:9px;color:#777777;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:4px;font-weight:700;">Order Date</span>
                    <span style="font-size:12px;font-weight:700;color:#111111;">${formattedDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-top:1px solid #ECEAE5;border-right:1px solid #ECEAE5;">
                    <span style="font-size:9px;color:#777777;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:4px;font-weight:700;">Payment Method</span>
                    <span style="font-size:12px;font-weight:700;color:#111111;">${paymentMethod}</span>
                  </td>
                  <td style="padding:12px 16px;border-top:1px solid #ECEAE5;">
                    <span style="font-size:9px;color:#777777;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:4px;font-weight:700;">Payment Status</span>
                    <span style="font-size:12px;font-weight:800;color:${paymentStatus.toLowerCase() === 'paid' ? '#16A34A' : '#D97706'};">
                      ${paymentStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- ORDER ITEMS LIST -->
              <h2 style="font-size:12px;font-weight:900;color:#111111;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 12px 0;padding-bottom:6px;border-bottom:2px solid #111111;">
                Items in Your Order (${items.length})
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                ${itemsHtml}
              </table>

              <!-- FINANCIAL BREAKDOWN -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;border:1px solid #ECEAE5;padding:14px 16px;margin-bottom:24px;">
                <tr>
                  <td style="padding:4px 0;font-size:12px;color:#555555;text-transform:uppercase;letter-spacing:0.05em;">Subtotal</td>
                  <td align="right" style="padding:4px 0;font-size:12px;font-weight:700;color:#111111;font-family:monospace;">
                    ₹${pricing.subtotal.toLocaleString('en-IN')}
                  </td>
                </tr>
                ${
                  pricing.discount && pricing.discount > 0
                    ? `<tr>
                  <td style="padding:4px 0;font-size:12px;color:#16A34A;text-transform:uppercase;letter-spacing:0.05em;">Discount</td>
                  <td align="right" style="padding:4px 0;font-size:12px;font-weight:700;color:#16A34A;font-family:monospace;">
                    -₹${pricing.discount.toLocaleString('en-IN')}
                  </td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding:4px 0;font-size:12px;color:#555555;text-transform:uppercase;letter-spacing:0.05em;">Shipping Charge</td>
                  <td align="right" style="padding:4px 0;font-size:12px;font-weight:700;color:#111111;font-family:monospace;">
                    ${pricing.shippingCharge === 0 ? '<span style="color:#16A34A;font-weight:800;">FREE</span>' : `₹${pricing.shippingCharge}`}
                  </td>
                </tr>
                ${
                  pricing.tax && pricing.tax > 0
                    ? `<tr>
                  <td style="padding:4px 0;font-size:11px;color:#777777;text-transform:uppercase;letter-spacing:0.05em;">Estimated GST / Taxes (Included)</td>
                  <td align="right" style="padding:4px 0;font-size:11px;font-weight:600;color:#777777;font-family:monospace;">
                    ₹${pricing.tax.toLocaleString('en-IN')}
                  </td>
                </tr>`
                    : ''
                }
                <tr>
                  <td colspan="2" style="padding:8px 0 0 0;border-top:2px solid #111111;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;font-weight:900;color:#111111;text-transform:uppercase;letter-spacing:0.05em;">Grand Total</td>
                        <td align="right" style="font-size:16px;font-weight:900;color:#E63B2E;font-family:monospace;">
                          ₹${pricing.totalPrice.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- DELIVERY ADDRESS -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #111111;margin-bottom:28px;">
                <tr>
                  <td style="background:#111111;padding:8px 16px;">
                    <span style="color:#FFCB05;font-size:10px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;">
                      SHIPPING & DELIVERY ADDRESS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0 0 4px 0;font-size:13px;font-weight:800;color:#111111;">
                      ${shippingDetails.recipientName}
                    </p>
                    <p style="margin:0 0 4px 0;font-size:12px;color:#444444;line-height:1.5;">
                      ${fullAddress}
                    </p>
                    <p style="margin:0;font-size:11px;color:#666666;font-family:monospace;">
                      Contact: <strong>${shippingDetails.phone}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="${ordersUrl}"
                       style="display:inline-block;background:#111111;color:#FFCB05;font-size:11px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;padding:16px 36px;border:3px solid #111111;box-shadow:4px 4px 0 0 #E63B2E;">
                      VIEW & TRACK YOUR ORDER &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:11px;color:#888888;text-align:center;line-height:1.6;margin:0 0 10px 0;">
                You can check the real-time shipping status and track your parcel anytime from your ATTIZ account.
              </p>
            </td>
          </tr>

          <!-- SUPPORT & FOOTER -->
          <tr>
            <td style="background:#F5F3ED;border-top:2px solid #111111;padding:18px 28px;text-align:center;">
              <p style="font-size:11px;font-weight:700;color:#111111;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.08em;">
                Questions about your order?
              </p>
              <p style="font-size:11px;color:#666666;margin:0 0 10px 0;">
                Reach out to our support team at <a href="mailto:support@attiz.in" style="color:#E63B2E;font-weight:700;text-decoration:none;">support@attiz.in</a>
              </p>
              <p style="font-size:9px;color:#999999;letter-spacing:0.12em;text-transform:uppercase;margin:0;">
                &copy; ${year} ATTIZ. ALL RIGHTS RESERVED.
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

/**
 * Sends an Order Confirmation email to the customer using Resend.
 */
export async function sendOrderConfirmationEmail(params: OrderConfirmationEmailParams): Promise<{ success: boolean; id?: string; error?: any }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ [EMAIL WARNING] RESEND_API_KEY is not configured in environment variables.');
      return { success: false, error: 'RESEND_API_KEY missing' };
    }

    if (!params.toEmail) {
      console.warn('⚠️ [EMAIL WARNING] No customer email provided for order confirmation.');
      return { success: false, error: 'Customer email missing' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: `ATTIZ Orders <${FROM_EMAIL()}>`,
      to: params.toEmail,
      subject: `Order Confirmed: ${params.orderNumber} | ATTIZ®`,
      html: buildOrderConfirmationEmailHtml(params),
    });

    if (error) {
      console.error('❌ [RESEND ERROR] Failed to send order confirmation email:', error);
      return { success: false, error };
    }

    console.log(`✅ [ORDER CONFIRMATION EMAIL SENT] to: ${params.toEmail} for Order #${params.orderNumber} (ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('❌ [EMAIL EXCEPTION] Error in sendOrderConfirmationEmail:', err);
    return { success: false, error: err.message || err };
  }
}
