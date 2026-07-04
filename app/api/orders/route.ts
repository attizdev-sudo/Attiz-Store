import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/session';

/** GET /api/orders — list orders (filtered by user unless admin) */
export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json([]);
  }

  const session = await verifySession(sessionCookie);
  if (!session) {
    return NextResponse.json([]);
  }

  let query = supabase.from('orders').select('*');
  if (session.role !== 'admin') {
    query = query.eq('user_id', session.id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST /api/orders — place a new order (Secure fallback) */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const session = await verifySession(sessionCookie);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
  }

  const body = await request.json();
  if (session.role !== 'admin') {
    body.user_id = session.id;
  }

  const { data, error } = await supabase.from('orders').insert(body).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

