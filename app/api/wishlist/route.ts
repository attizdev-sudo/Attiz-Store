import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { validateSession } from '@/lib/auth/session';

/** GET /api/wishlist — fetch user's wishlisted items */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('attiz_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json([], { status: 401 });
    }

    const sessionData = await validateSession(sessionCookie);
    if (!sessionData) {
      return NextResponse.json([], { status: 401 });
    }

    const { user } = sessionData;

    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id,
        user_id,
        variant_id,
        created_at,
        product_variants (
          id,
          product_id,
          color,
          size,
          stock,
          price,
          discount,
          sku,
          product_variant_images (
            image_url,
            sort_order
          ),
          products (
            id,
            title,
            description,
            category_id,
            slug
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (data || []).map((item: any) => {
      const variant = item.product_variants;
      const product = variant?.products;
      const images = variant?.product_variant_images || [];
      const primaryImage = images.length > 0 ? images[0].image_url : null;

      return {
        id: item.id,
        user_id: item.user_id,
        variant_id: item.variant_id,
        product_id: product?.id || null,
        title: product?.title || 'Product',
        description: product?.description || '',
        color: variant?.color || '',
        size: variant?.size || '',
        stock: variant?.stock ?? 0,
        price: variant ? parseFloat(String(variant.price)) : 0,
        discount: variant ? parseFloat(String(variant.discount || 0)) : 0,
        image: primaryImage || 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
        created_at: item.created_at,
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    console.error('Wishlist GET exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/wishlist — add item to wishlist */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('attiz_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const sessionData = await validateSession(sessionCookie);
    if (!sessionData) {
      return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
    }

    const { user } = sessionData;
    const body = await request.json();
    const { variant_id, product_id } = body;

    let targetVariantId = variant_id;

    if (!targetVariantId && product_id) {
      // Find the first variant for this product
      const { data: variants, error: varErr } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', product_id)
        .limit(1);

      if (varErr || !variants || variants.length === 0) {
        return NextResponse.json({ error: 'No product variant found.' }, { status: 400 });
      }
      targetVariantId = variants[0].id;
    }

    if (!targetVariantId) {
      return NextResponse.json({ error: 'variant_id or product_id is required.' }, { status: 400 });
    }

    // Check if item is already in wishlist
    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('variant_id', targetVariantId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Item already in wishlist', id: existing.id }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: user.id,
        variant_id: targetVariantId,
      })
      .select()
      .single();

    if (error) {
      console.error('Wishlist POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, item: data }, { status: 201 });
  } catch (err) {
    console.error('Wishlist POST exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/wishlist — remove item from wishlist */
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('attiz_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const sessionData = await validateSession(sessionCookie);
    if (!sessionData) {
      return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
    }

    const { user } = sessionData;
    const { searchParams } = new URL(request.url);

    const wishlistId = searchParams.get('id');
    const variantId = searchParams.get('variant_id');
    const productId = searchParams.get('product_id');

    let query = supabase.from('wishlist').delete().eq('user_id', user.id);

    if (wishlistId) {
      query = query.eq('id', wishlistId);
    } else if (variantId) {
      query = query.eq('variant_id', variantId);
    } else if (productId) {
      // Find variants for product_id
      const { data: variants } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId);

      const variantIds = (variants || []).map((v: any) => v.id);
      if (variantIds.length === 0) {
        return NextResponse.json({ message: 'No variants found' });
      }
      query = query.in('variant_id', variantIds);
    } else {
      return NextResponse.json({ error: 'Specify id, variant_id, or product_id to delete.' }, { status: 400 });
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Wishlist DELETE exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
