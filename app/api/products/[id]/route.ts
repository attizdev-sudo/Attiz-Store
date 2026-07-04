import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

type Params = Promise<{ id: string }>;

/** GET /api/products/:id */
export async function GET(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

/** PUT /api/products/:id */
export async function PUT(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const { data, error } = await supabase.from('products').update(body).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

/** DELETE /api/products/:id */
export async function DELETE(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
