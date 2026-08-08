import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID?.trim() || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

export const isRazorpayConfigured = Boolean(keyId && keySecret);

/**
 * Server-side Razorpay instance helper.
 */
export function getRazorpayInstance() {
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials missing in environment variables (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).');
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Verify Razorpay payment HMAC SHA-256 signature
 */
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  if (!keySecret) return false;
  try {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');
    return expectedSignature === razorpaySignature;
  } catch (err) {
    console.error('Razorpay signature verification error:', err);
    return false;
  }
}
