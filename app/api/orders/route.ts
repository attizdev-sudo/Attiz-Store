import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { validateSession } from '@/lib/auth/session';

const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';

/** 
 * GET /api/orders — list orders (filtered by authenticated user unless admin).
 * Joins order_items table and enriches primary product/variant thumbnail images.
 */
export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json([]);
  }

  const sessionData = await validateSession(sessionCookie);
  if (!sessionData) {
    return NextResponse.json([]);
  }
  const { user } = sessionData;

  let query = supabase.from('orders').select('*, order_items(*)');
  if (user.role !== 'admin') {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch product details to enrich images and variants if missing/dummy
  let productsMap: Record<string, any> = {};
  let variantsMap: Record<string, any> = {};

  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, image, title, product_variants(id, color, size, product_variant_images(image_url))');
    
    if (products) {
      products.forEach((p: any) => {
        productsMap[p.id] = p;
        if (p.product_variants) {
          p.product_variants.forEach((v: any) => {
            variantsMap[v.id] = { ...v, parentProduct: p };
          });
        }
      });
    }
  } catch (err) {
    console.warn('Could not fetch products for image mapping:', err);
  }

  const enrichedOrders = (data || []).map((order: any) => {
    let items = order.items;

    // Helper function to find best primary image for a given product & variant/color
    const resolvePrimaryImage = (productId?: string, variantId?: string, colorName?: string, existingImg?: string) => {
      // If existing image is a valid non-dummy URL, return it
      if (existingImg && existingImg !== '/placeholder.png' && existingImg !== DEFAULT_PRODUCT_IMAGE) {
        return existingImg;
      }

      // 1. Direct variant_id match
      if (variantId && variantsMap[variantId]) {
        const vImg = variantsMap[variantId].product_variant_images?.[0]?.image_url;
        if (vImg) return vImg;
      }

      // 2. Product ID match + Color match
      if (productId && productsMap[productId]) {
        const prod = productsMap[productId];
        if (colorName && prod.product_variants) {
          const colorVariant = prod.product_variants.find(
            (v: any) => v.color && v.color.toLowerCase() === colorName.toLowerCase()
          );
          if (colorVariant?.product_variant_images?.[0]?.image_url) {
            return colorVariant.product_variant_images[0].image_url;
          }
        }

        // 3. Product primary image
        if (prod.image && prod.image !== DEFAULT_PRODUCT_IMAGE) {
          return prod.image;
        }

        // 4. Any variant image of product
        if (prod.product_variants) {
          for (const v of prod.product_variants) {
            if (v.product_variant_images?.[0]?.image_url) {
              return v.product_variant_images[0].image_url;
            }
          }
        }
      }

      return existingImg || DEFAULT_PRODUCT_IMAGE;
    };

    // If order.items is missing or empty, construct items from order_items relation
    if ((!items || !Array.isArray(items) || items.length === 0) && Array.isArray(order.order_items) && order.order_items.length > 0) {
      items = order.order_items.map((oi: any) => {
        const matchingProd = oi.product_id ? productsMap[oi.product_id] : null;
        const matchingVariant = oi.variant_id ? variantsMap[oi.variant_id] : null;
        const colorVal = oi.color || matchingVariant?.color || '';
        const realImg = resolvePrimaryImage(oi.product_id, oi.variant_id, colorVal, oi.image);

        return {
          id: oi.id,
          product_id: oi.product_id,
          variant_id: oi.variant_id || matchingVariant?.id || null,
          title: oi.product_title || matchingProd?.title || 'Ordered Product',
          price: Number(oi.unit_price) || 0,
          quantity: oi.quantity || 1,
          selectedSize: oi.size,
          color: colorVal,
          image: realImg,
        };
      });
    } else if (Array.isArray(items)) {
      // Ensure image thumbnail, variant_id, and color are resolved cleanly on existing items
      items = items.map((item: any) => {
        const pId = item.product_id || item.id;
        const vId = item.variant_id;
        const colorVal = item.color || item.selectedColor || '';
        
        item.image = resolvePrimaryImage(pId, vId, colorVal, item.image);
        if (!item.color) item.color = colorVal;
        if (!item.variant_id && vId) item.variant_id = vId;
        return item;
      });
    }

    const formattedAddress = order.shipping_address1
      ? `${order.shipping_address1}${order.shipping_address2 ? `, ${order.shipping_address2}` : ''}, ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}`
      : order.shipping_address || 'Address provided at checkout';

    return {
      ...order,
      items: items && items.length > 0 ? items : [],
      shipping_address: formattedAddress,
    };
  });

  return NextResponse.json(enrichedOrders);
}

/** POST /api/orders — place a new order (Secure fallback) */
export async function POST(request: Request) {
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
  if (user.role !== 'admin') {
    body.user_id = user.id;
  }

  const { data, error } = await supabase.from('orders').insert(body).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
