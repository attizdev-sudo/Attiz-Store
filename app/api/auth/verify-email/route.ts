import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/auth/auth';

/**
 * GET /api/auth/verify-email?token=<token>
 * Verifies the user's email and auto-logs them in.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_token`);
  }

  // Find the token record
  const { data: record, error: fetchError } = await supabase
    .from('email_verification_tokens')
    .select('id, user_id, expires_at, used_at')
    .eq('token', token)
    .maybeSingle();

  if (fetchError || !record) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_token`);
  }

  // Token already used
  if (record.used_at) {
    return NextResponse.redirect(`${appUrl}/login?error=token_already_used`);
  }

  // Token expired
  if (new Date() > new Date(record.expires_at)) {
    return NextResponse.redirect(`${appUrl}/login?error=token_expired`);
  }

  // Mark token as used
  await supabase
    .from('email_verification_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', record.id);

  // Mark user's email as verified
  const { data: user, error: updateError } = await supabase
    .from('users')
    .update({ email_verified: true })
    .eq('id', record.user_id)
    .select('id, first_name, last_name, email, phone, role')
    .single();

  if (updateError || !user) {
    return NextResponse.redirect(`${appUrl}/login?error=verification_failed`);
  }

  // Auto-login the user after successful verification
  const ipAddress = request.headers.get('x-forwarded-for') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  const { token: sessionToken, expiresAt } = await createSession(user.id, ipAddress, userAgent);
  await setSessionCookie(sessionToken, expiresAt);

  // Redirect to home with success flag
  return NextResponse.redirect(`${appUrl}/?verified=true`);
}
