import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

type Params = Promise<{ id: string }>;

/** GET /api/orders/:id */
export async function GET(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

/** PUT /api/orders/:id — update order status */
export async function PUT(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  let status: string;
  try {
    ({ status } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
