import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/auth/email';
import crypto from 'crypto';

/**
 * POST /api/auth/resend-verification
 * Body: { email: string }
 * Sends a new verification email. Always returns 200 to prevent email enumeration.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body?.email || '').toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ ok: true }); // Silently succeed
    }

    // Look up user by email
    const { data: user } = await supabase
      .from('users')
      .select('id, first_name, email, email_verified, account_status')
      .eq('email', email)
      .maybeSingle();

    // If user not found or already verified, silently succeed (prevents enumeration)
    if (!user || user.email_verified) {
      return NextResponse.json({ ok: true });
    }

    // If account is blocked or deleted, silently succeed
    if (user.account_status !== 'active') {
      return NextResponse.json({ ok: true });
    }

    // Expire all existing tokens for this user
    await supabase
      .from('email_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('used_at', null);

    // Create a new token
    const newToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await supabase.from('email_verification_tokens').insert({
      user_id: user.id,
      token: newToken,
      expires_at: expiresAt.toISOString(),
    });

    // Send the email
    await sendVerificationEmail(user.email, newToken, user.first_name);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Resend verification error:', error);
    // Return ok to not reveal internal errors
    return NextResponse.json({ ok: true });
  }
}
