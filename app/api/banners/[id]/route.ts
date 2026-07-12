import { NextResponse } from 'next/server';
import { supabase, deleteUnreferencedImages } from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function DELETE(_: Request, { params }: { params: Params }) {
  const { id } = await params;

  // Fetch banner image URL for cleanup
  const { data: banner } = await supabase
    .from('banners')
    .select('image_url')
    .eq('id', id)
    .single();

  const imageUrl = banner?.image_url;

  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (imageUrl) {
    await deleteUnreferencedImages([imageUrl]);
  }

  return NextResponse.json({ success: true });
}
