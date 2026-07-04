import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/** GET /api/orders — list all orders */
export async function GET() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST /api/orders — place a new order */
export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase.from('orders').insert(body).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
