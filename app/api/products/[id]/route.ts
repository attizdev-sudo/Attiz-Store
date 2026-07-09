import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { getSessionCookieFromHeaders, verifySession } from '@/lib/session';

type Params = Promise<{ id: string }>;

/** GET /api/products/:id */
export async function GET(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (
        *,
        product_variant_images (
          *
        )
      )
    `)
    .eq('id', id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

/** PUT /api/products/:id (Admin Only) */
export async function PUT(request: Request, { params }: { params: Params }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value || getSessionCookieFromHeaders(request.headers);
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const session = await verifySession(sessionCookie);
  const isAdmin = Boolean(session && (session.role === 'admin' || session.role === 'super_admin' || session.role === 'Administrator' || session.role === 'administrator'));
  if (!session || !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  const { id } = await params;
  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { product, variants } = body;

  if (!product) {
    return NextResponse.json({ error: 'Product payload is required.' }, { status: 400 });
  }

  // 1. Update product table
  const { data: prodData, error: prodErr } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 400 });

  // 2. Fetch old variants to delete their variant images and entries
  const { data: oldVars } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', id);

  if (oldVars && oldVars.length > 0) {
    const varIds = oldVars.map((v: { id: string }) => v.id);
    // Delete variant images
    await supabase.from('product_variant_images').delete().in('variant_id', varIds);
    // Delete variants
    await supabase.from('product_variants').delete().in('id', varIds);
  }

  // 3. Insert new variants and variant images
  if (variants && variants.length > 0) {
    for (const variant of variants) {
      const { images, ...variantData } = variant;
      const { data: varData, error: varErr } = await supabase
        .from('product_variants')
        .insert({ ...variantData, product_id: id })
        .select()
        .single();

      if (varErr) {
        console.error('Variant insert error:', varErr);
        continue;
      }

      if (images && images.length > 0) {
        const imagePayload = images.map((img: string, idx: number) => ({
          variant_id: varData.id,
          image_url: img,
          sort_order: idx,
        }));
        const { error: imgErr } = await supabase
          .from('product_variant_images')
          .insert(imagePayload);
        if (imgErr) {
          console.error('Variant images insert error:', imgErr);
        }
      }
    }
  }

  return NextResponse.json(prodData);
}

/** DELETE /api/products/:id (Admin Only) */
export async function DELETE(request: Request, { params }: { params: Params }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value || getSessionCookieFromHeaders(request.headers);
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const session = await verifySession(sessionCookie);
  const isAdmin = Boolean(session && (session.role === 'admin' || session.role === 'super_admin' || session.role === 'Administrator' || session.role === 'administrator'));
  if (!session || !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  const { id } = await params;

  // 1. Fetch variant IDs for this product
  const { data: oldVars } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', id);

  if (oldVars && oldVars.length > 0) {
    const varIds = oldVars.map((v: { id: string }) => v.id);
    // Delete variant images
    await supabase.from('product_variant_images').delete().in('variant_id', varIds);
    // Delete variants
    await supabase.from('product_variants').delete().in('id', varIds);
  }

  // 2. Delete product
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

