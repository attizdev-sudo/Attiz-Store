import { NextResponse } from 'next/server';
import { supabase, hashPassword } from '@/lib/db';
import { signSession } from '@/lib/session';

/** POST /api/auth/signup */
export async function POST(request: Request) {
  let firstName: string, lastName: string, phone: string, password: string;
  try {
    ({ firstName, lastName, phone, password } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!firstName || !lastName || !phone || !password) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  const { data: existing } = await supabase.from('users').select('*').eq('phone', phone);
  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'Phone number already registered.' }, { status: 409 });
  }

  const hashedPassword = await hashPassword(password);
  const { error: insertError } = await supabase.from('users').insert({
    first_name: firstName,
    last_name: lastName,
    phone,
    password_hash: hashedPassword,
    role: 'customer',
  });

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  const { data: created } = await supabase.from('users').select('*').eq('phone', phone);
  if (created && created[0]) {
    const user = {
      id: created[0].id,
      first_name: created[0].first_name,
      last_name: created[0].last_name,
      phone: created[0].phone,
      role: created[0].role,
    };

    const signedSession = await signSession({ role: user.role, id: user.id });
    const response = NextResponse.json({ user }, { status: 201 });
    response.headers.append(
      'Set-Cookie',
      `attiz_session=${signedSession}; Path=/; SameSite=Strict; Max-Age=86400`
    );
    return response;
  }

  return NextResponse.json({ message: 'Registration successful.' }, { status: 201 });
}

