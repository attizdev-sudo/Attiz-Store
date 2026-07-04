import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function DELETE(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
