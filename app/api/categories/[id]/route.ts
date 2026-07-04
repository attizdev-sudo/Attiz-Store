import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function PUT(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  let name: string;
  try {
    ({ name } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const { data, error } = await supabase.from('categories').update({ name }).eq('id', id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
