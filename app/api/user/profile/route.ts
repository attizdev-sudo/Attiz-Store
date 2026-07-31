import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { validateSession } from '@/lib/auth/session';

/**
 * PATCH /api/user/profile
 * Updates authenticated user details (phone number, name).
 */
export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const sessionData = await validateSession(sessionCookie);
  if (!sessionData) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { user } = sessionData;

  try {
    const body = await request.json();
    const { phone, first_name, last_name } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (phone !== undefined) {
      const cleanPhone = phone.trim();
      if (!cleanPhone) {
        return NextResponse.json({ error: 'Phone number cannot be empty.' }, { status: 400 });
      }
      updates.phone = cleanPhone;
    }

    if (first_name !== undefined) updates.first_name = first_name.trim();
    if (last_name !== undefined) updates.last_name = last_name.trim();

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select('id, first_name, last_name, email, phone, role')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This phone number is already registered to another account.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid request body.' }, { status: 400 });
  }
}
