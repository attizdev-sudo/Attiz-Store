import { NextResponse } from 'next/server';
import { supabase, hashPassword } from '@/lib/db';
import { signSession } from '@/lib/session';

/** POST /api/auth/signin */
export async function POST(request: Request) {
  let phoneOrEmail: string, password: string;
  try {
    ({ phoneOrEmail, password } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!phoneOrEmail || !password) {
    return NextResponse.json({ error: 'Phone/email and password are required.' }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);
  const isEmail = phoneOrEmail.includes('@');
  const query = supabase.from('users').select('*');
  const { data, error } = await (isEmail
    ? query.eq('email', phoneOrEmail)
    : query.eq('phone', phoneOrEmail));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const match = data[0];
  if (match.password_hash !== hashedPassword) {
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  const user = {
    id: match.id,
    first_name: match.first_name,
    last_name: match.last_name,
    phone: match.phone || '',
    email: match.email || '',
    role: match.role || 'customer',
  };

  const signedSession = await signSession({ role: user.role, id: user.id });
  const response = NextResponse.json({ user });
  response.headers.append(
    'Set-Cookie',
    `attiz_session=${signedSession}; Path=/; SameSite=Strict; Max-Age=86400`
  );

  return response;
}

