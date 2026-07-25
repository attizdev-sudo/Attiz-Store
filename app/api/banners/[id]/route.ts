import { NextResponse } from 'next/server';
import { supabase, deleteUnreferencedImages } from '@/lib/db';

type Params = Promise<{ id: string }>;

/** PUT /api/banners/:id — update a banner */
export async function PUT(request: Request, { params }: { params: Params }) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Fetch old banner image URL for cleanup if replaced
  const { data: oldBanner } = await supabase
    .from('banners')
    .select('image_url')
    .eq('id', id)
    .single();

  const oldImageUrl = oldBanner?.image_url;

  const { data, error } = await supabase
    .from('banners')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (oldImageUrl && data?.image_url && oldImageUrl !== data.image_url) {
    await deleteUnreferencedImages([oldImageUrl]);
  }

  return NextResponse.json(data);
}

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
