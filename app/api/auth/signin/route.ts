import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth/auth';

/**
 * POST /api/auth/signin
 * Backward compatibility route supporting phone/email login with secure database session management.
 */
export async function POST(request: Request) {
  try {
    let phoneOrEmail: string, password: string;
    try {
      ({ phoneOrEmail, password } = await request.json());
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!phoneOrEmail || !password) {
      return NextResponse.json({ error: 'Email or phone and password are required.' }, { status: 400 });
    }

    const isEmail = phoneOrEmail.includes('@');
    const query = supabase.from('users').select('id, first_name, last_name, email, phone, role, password_hash');
    const { data: user, error } = await (isEmail
      ? query.eq('email', phoneOrEmail.toLowerCase()).maybeSingle()
      : query.eq('phone', phoneOrEmail).maybeSingle());

    if (error || !user || !user.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Verify hashed password via Argon2id
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Retrieve headers/context for session logging
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create session in database
    const { token, expiresAt } = await createSession(user.id, ipAddress, userAgent);

    // Set cookie
    await setSessionCookie(token, expiresAt);

    // Clean user object
    const { password_hash, ...cleanUser } = user;

    return NextResponse.json({ user: cleanUser });
  } catch (error) {
    console.error('Signin backward-compatibility route error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during signin.' }, { status: 500 });
  }
}
