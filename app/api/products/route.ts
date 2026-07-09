import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { getSessionCookieFromHeaders, verifySession } from '@/lib/session';

/** GET /api/products — list all products */
export async function GET() {
  try {
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
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const formatted = data?.map((prod: any) => ({
      ...prod,
      category_ids: prod.product_categories?.map((pc: any) => pc.category_id) || [],
    })) || [];

    return NextResponse.json(formatted);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/products — create a new product (Admin Only) */
export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const { product, variants, category_ids } = body;

    if (!product || !product.title) {
      return NextResponse.json({ error: 'Product title is required.' }, { status: 400 });
    }

    // Assign primary category for backward compatibility
    if (category_ids && category_ids.length > 0) {
      product.category_id = category_ids[0];
    } else {
      product.category_id = null;
    }

    // 1. Insert product
    const { data: prodData, error: prodErr } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 400 });

    // 1b. Bulk insert category relations
    if (category_ids && category_ids.length > 0) {
      const relationPayload = category_ids.map((catId: string) => ({
        product_id: prodData.id,
        category_id: catId,
      }));
      const { error: relErr } = await supabase
        .from('product_categories')
        .insert(relationPayload);
      if (relErr) {
        console.error('Product categories insert error:', relErr);
      }
    }

    // 2. Insert variants and variant images
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        const { images, ...variantData } = variant;
        const { data: varData, error: varErr } = await supabase
          .from('product_variants')
          .insert({ ...variantData, product_id: prodData.id })
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

    return NextResponse.json({ ...prodData, category_ids: category_ids || [] }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/products internal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

