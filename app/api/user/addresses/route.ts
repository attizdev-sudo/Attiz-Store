import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { validateSession } from '@/lib/auth/session';

/**
 * GET /api/user/addresses
 * Fetches all saved shipping addresses for the authenticated user.
 */
export async function GET() {
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

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ addresses: data || [] });
}

/**
 * POST /api/user/addresses
 * Adds a new shipping address for the authenticated user.
 */
export async function POST(request: Request) {
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
    const {
      recipient_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      country = 'India',
      postal_code,
      is_default = false,
    } = body;

    if (!recipient_name || !phone || !address_line1 || !city || !state || !postal_code) {
      return NextResponse.json({ error: 'Required address fields are missing.' }, { status: 400 });
    }

    if (is_default) {
      // Unset previous default addresses for this user
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        recipient_name,
        phone,
        address_line1,
        address_line2: address_line2 || null,
        city,
        state,
        country,
        postal_code,
        is_default,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, address: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid request body.' }, { status: 400 });
  }
}
