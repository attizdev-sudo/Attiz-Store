import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase, deleteUnreferencedImages } from '@/lib/db';
import { getSessionCookieFromHeaders, verifySession } from '@/lib/session';

type Params = Promise<{ id: string }>;

/** GET /api/products/:id */
export async function GET(_: Request, { params }: { params: Params }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_categories (
        category_id
      ),
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
  const formatted = {
    ...data,
    category_ids: data.product_categories?.map((pc: any) => pc.category_id) || []
  };
  return NextResponse.json(formatted);
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

  const { product, variants, category_ids } = body;

  if (!product) {
    return NextResponse.json({ error: 'Product payload is required.' }, { status: 400 });
  }

  // Update primary category for backward compatibility
  if (category_ids && category_ids.length > 0) {
    product.category_id = category_ids[0];
  } else {
    product.category_id = null;
  }

  // Fetch old product information (including size_chart) and old variant images for cleanup
  const { data: oldProduct } = await supabase
    .from('products')
    .select('size_chart')
    .eq('id', id)
    .single();

  const { data: oldVarsForCleanup } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', id);

  let oldImageUrls: string[] = [];
  if (oldProduct?.size_chart) {
    oldImageUrls.push(oldProduct.size_chart);
  }

  if (oldVarsForCleanup && oldVarsForCleanup.length > 0) {
    const varIds = oldVarsForCleanup.map((v: { id: string }) => v.id);
    const { data: oldImages } = await supabase
      .from('product_variant_images')
      .select('image_url')
      .in('variant_id', varIds);
    if (oldImages) {
      oldImages.forEach((img: any) => {
        if (img.image_url && !oldImageUrls.includes(img.image_url)) {
          oldImageUrls.push(img.image_url);
        }
      });
    }
  }

  // 1. Update product table
  const { data: prodData, error: prodErr } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 400 });

  // 1b. Update category mappings
  if (category_ids) {
    // Delete existing relation entries
    await supabase.from('product_categories').delete().eq('product_id', id);

    // Bulk insert new relation entries
    if (category_ids.length > 0) {
      const relationPayload = category_ids.map((catId: string) => ({
        product_id: id,
        category_id: catId,
      }));
      const { error: relErr } = await supabase
        .from('product_categories')
        .insert(relationPayload);
      if (relErr) {
        console.error('Product categories update error:', relErr);
      }
    }
  }

  // 2. Delete old variants (database cascade automatically deletes product_variant_images)
  await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', id);

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

  if (oldImageUrls.length > 0) {
    await deleteUnreferencedImages(oldImageUrls);
  }

  return NextResponse.json({ ...prodData, category_ids: category_ids || [] });
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

  // Fetch old product information and variant images for cleanup
  const { data: oldProduct } = await supabase
    .from('products')
    .select('size_chart')
    .eq('id', id)
    .single();

  const { data: oldVars } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', id);

  let oldImageUrls: string[] = [];
  if (oldProduct?.size_chart) {
    oldImageUrls.push(oldProduct.size_chart);
  }

  if (oldVars && oldVars.length > 0) {
    const varIds = oldVars.map((v: { id: string }) => v.id);
    const { data: oldImages } = await supabase
      .from('product_variant_images')
      .select('image_url')
      .in('variant_id', varIds);
    if (oldImages) {
      oldImages.forEach((img: any) => {
        if (img.image_url && !oldImageUrls.includes(img.image_url)) {
          oldImageUrls.push(img.image_url);
        }
      });
    }
  }

  // 2. Delete product (database cascade automatically deletes product_categories, product_variants, and product_variant_images)
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Cleanup files from storage if they are no longer referenced anywhere else
  if (oldImageUrls.length > 0) {
    await deleteUnreferencedImages(oldImageUrls);
  }

  return NextResponse.json({ success: true });
}

