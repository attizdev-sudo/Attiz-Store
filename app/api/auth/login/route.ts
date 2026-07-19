import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/db';
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/** POST /api/auth/login */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    const { email, password } = result.data;

    // Look up user by email — include verification and status fields
    const { data: user, error: selectError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone, role, password_hash, email_verified, account_status')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    // 1. User not found
    if (selectError || !user || !user.password_hash) {
      return NextResponse.json({
        error: 'No account found with this email address.',
        code: 'USER_NOT_FOUND',
      }, { status: 401 });
    }

    // 2. Incorrect password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({
        error: 'Incorrect password. Please try again.',
        code: 'WRONG_PASSWORD',
      }, { status: 401 });
    }

    // 3. Email not verified
    if (!user.email_verified) {
      return NextResponse.json({
        error: 'Your email address has not been verified.',
        code: 'EMAIL_NOT_VERIFIED',
        hint: 'Please check your inbox for the verification link, or request a new one.',
      }, { status: 403 });
    }

    // 4. Account blocked or deleted
    if (user.account_status !== 'active') {
      return NextResponse.json({
        error: 'Your account has been suspended. Please contact support.',
        code: 'ACCOUNT_SUSPENDED',
      }, { status: 403 });
    }

    // Extract headers for session logging
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create session
    const { token, expiresAt } = await createSession(user.id, ipAddress, userAgent);

    // Set cookie
    await setSessionCookie(token, expiresAt);

    // Return clean user object
    const { password_hash, email_verified, account_status, ...cleanUser } = user;

    return NextResponse.json({ user: cleanUser });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during login.' }, { status: 500 });
  }
}
