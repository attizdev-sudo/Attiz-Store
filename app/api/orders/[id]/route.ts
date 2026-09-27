import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/session';

type Params = Promise<{ id: string }>;

/** GET /api/orders/:id */
export async function GET(_: Request, { params }: { params: Params }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const session = await verifySession(sessionCookie);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
  }

  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = supabase
    .from('orders')
    .select('*, order_items(*), payments(*)');

  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.eq('order_number', id);
  }

  const { data: order, error } = await query.maybeSingle();

  if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  if (session.role !== 'admin' && order.user_id !== session.id) {
    return NextResponse.json({ error: 'Forbidden. Access denied.' }, { status: 403 });
  }

  let items = order.items;

  // Enforce item enrichment if items are missing or lack images
  const productIds = new Set<string>();
  if (Array.isArray(items)) {
    items.forEach((it: any) => {
      if (it.product_id) productIds.add(it.product_id);
      if (it.id) productIds.add(it.id);
    });
  }
  if (Array.isArray(order.order_items)) {
    order.order_items.forEach((oi: any) => {
      if (oi.product_id) productIds.add(oi.product_id);
    });
  }

  let productsMap: Record<string, any> = {};
  let variantsMap: Record<string, any> = {};

  if (productIds.size > 0) {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('id, image, title, product_variants(id, color, size, product_variant_images(image_url))')
        .in('id', Array.from(productIds));

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
  }

  const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';

  const resolvePrimaryImage = (productId?: string, variantId?: string, colorName?: string, existingImg?: string) => {
    if (existingImg && existingImg !== '/placeholder.png' && existingImg !== DEFAULT_PRODUCT_IMAGE) {
      return existingImg;
    }
    if (variantId && variantsMap[variantId]) {
      const vImg = variantsMap[variantId].product_variant_images?.[0]?.image_url;
      if (vImg) return vImg;
    }
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
      if (prod.image && prod.image !== DEFAULT_PRODUCT_IMAGE) {
        return prod.image;
      }
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

  if ((!items || !Array.isArray(items) || items.length === 0) && Array.isArray(order.order_items) && order.order_items.length > 0) {
    items = order.order_items.map((oi: any) => {
      const matchingProd = oi.product_id ? productsMap[oi.product_id] : null;
      const matchingVariant = oi.variant_id ? variantsMap[oi.variant_id] : null;
      const colorVal = oi.color || matchingVariant?.color || '';
      const realImg = resolvePrimaryImage(oi.product_id, oi.variant_id, colorVal, oi.image_url);

      const finalUnitPrice = Number(oi.unit_price ?? oi.price ?? 0);
      const originalUnitPrice = Number(oi.original_price ?? oi.mrp ?? finalUnitPrice ?? 0);
      const itemDiscount = Number(oi.discount ?? Math.max(0, originalUnitPrice - finalUnitPrice) ?? 0);

      return {
        id: oi.id,
        product_id: oi.product_id,
        variant_id: oi.variant_id || matchingVariant?.id || null,
        title: oi.product_title || matchingProd?.title || 'Ordered Product',
        price: finalUnitPrice,
        unit_price: finalUnitPrice,
        original_price: originalUnitPrice,
        mrp: originalUnitPrice,
        discount: itemDiscount,
        quantity: oi.quantity || 1,
        selectedSize: oi.size,
        color: colorVal,
        image: realImg,
      };
    });
  } else if (Array.isArray(items)) {
    items = items.map((item: any) => {
      const pId = item.product_id || item.id;
      const vId = item.variant_id;
      const colorVal = item.color || item.selectedColor || '';
      const finalUnitPrice = Number(item.unit_price ?? item.price ?? 0);
      const originalUnitPrice = Number(item.original_price ?? item.mrp ?? finalUnitPrice ?? 0);
      const itemDiscount = Number(item.discount ?? Math.max(0, originalUnitPrice - finalUnitPrice) ?? 0);

      item.image = resolvePrimaryImage(pId, vId, colorVal, item.image);
      if (!item.color) item.color = colorVal;
      if (!item.variant_id && vId) item.variant_id = vId;
      item.unit_price = finalUnitPrice;
      item.price = finalUnitPrice;
      item.original_price = originalUnitPrice;
      item.mrp = originalUnitPrice;
      item.discount = itemDiscount;
      return item;
    });
  }

  const formattedAddress = order.shipping_address1
    ? `${order.shipping_address1}${order.shipping_address2 ? `, ${order.shipping_address2}` : ''}, ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}`
    : order.shipping_address || 'Address provided at checkout';

  const paidAmount = Array.isArray(order.payments) && order.payments.length > 0
    ? order.payments.reduce((sum: number, p: any) => {
        const st = String(p.status || '').toLowerCase();
        if (!st || st === 'paid' || st === 'success' || st === 'captured') {
          return sum + Number(p.amount || 0);
        }
        return sum;
      }, 0)
    : (String(order.payment_status || '').toLowerCase() === 'paid' ? Number(order.total_price || 0) : 0);

  return NextResponse.json({
    ...order,
    items: items && items.length > 0 ? items : [],
    shipping_address: formattedAddress,
    paid_amount: paidAmount,
    amount_paid: paidAmount,
  });
}

/** PUT /api/orders/:id — update order details & items (Admin Only) */
export async function PUT(request: Request, { params }: { params: Params }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const session = await verifySession(sessionCookie);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  const { id } = await params;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const allowedOrderFields = [
    'status',
    'payment_status',
    'shipping_name',
    'shipping_phone',
    'shipping_address1',
    'shipping_address2',
    'shipping_city',
    'shipping_state',
    'shipping_country',
    'shipping_postal_code',
    'subtotal',
    'discount',
    'shipping_charge',
    'tax',
    'total_price',
    'awb_code',
    'courier_name',
    'tracking_url',
    'shiprocket_order_id',
    'shiprocket_shipment_id',
    'edd',
  ];

  const orderUpdates: Record<string, any> = {};
  for (const field of allowedOrderFields) {
    if (body[field] !== undefined) {
      orderUpdates[field] = body[field];
    }
  }

  // Also support legacy aliases
  if (body.customer_name && !orderUpdates.shipping_name) {
    orderUpdates.shipping_name = body.customer_name;
  }
  if (body.customer_phone && !orderUpdates.shipping_phone) {
    orderUpdates.shipping_phone = body.customer_phone;
  }

  orderUpdates.updated_at = new Date().toISOString();

  if (Object.keys(orderUpdates).length > 0) {
    console.log(`📝 [ORDERS TABLE UPDATE PAYLOAD (Order ID: ${id})]:\n`, JSON.stringify(orderUpdates, null, 2));

    const { error: orderErr } = await supabase
      .from('orders')
      .update(orderUpdates)
      .eq('id', id);

    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 400 });
    }
  }

  // Update order_items if items array is sent
  if (Array.isArray(body.items)) {
    try {
      const variantIds = body.items.map((i: any) => i.variant_id).filter(Boolean);
      let variantMap: Record<string, { sku?: string; gst_rate?: number; discount?: number; price?: number }> = {};

      if (variantIds.length > 0) {
        const { data: vData } = await supabase
          .from('product_variants')
          .select('id, sku, gst_rate, discount, price')
          .in('id', variantIds);
        if (vData) {
          vData.forEach((v: any) => {
            variantMap[v.id] = {
              sku: v.sku || undefined,
              gst_rate: v.gst_rate !== null && v.gst_rate !== undefined ? Number(v.gst_rate) : undefined,
              discount: v.discount !== null && v.discount !== undefined ? Number(v.discount) : undefined,
              price: v.price !== null && v.price !== undefined ? Number(v.price) : undefined,
            };
          });
        }
      }

      await supabase.from('order_items').delete().eq('order_id', id);

      const itemsToInsert = body.items.map((item: any) => {
        const vInfo = item.variant_id ? variantMap[item.variant_id] : {};
        const finalSellingPrice = Number(item.price ?? item.unit_price ?? 0);
        const qty = Number(item.quantity) || 1;
        const gstRate = Number(item.gst_rate ?? vInfo?.gst_rate ?? 5);
        const discountPct = Number(item.discount_percentage ?? vInfo?.discount ?? 0);

        const taxablePrice = gstRate > 0 ? Math.round(finalSellingPrice / (1 + gstRate / 100)) : finalSellingPrice;
        const originalMRP = Number(item.original_price ?? vInfo?.price ?? (discountPct > 0 ? Math.round(taxablePrice / (1 - discountPct / 100)) : finalSellingPrice));
        const itemDiscountPerUnit = Math.max(0, originalMRP - taxablePrice);
        const itemTaxPerUnit = Math.max(0, finalSellingPrice - taxablePrice);
        const skuVal = item.sku || vInfo?.sku || null;

        return {
          order_id: id,
          product_id: item.product_id || item.id || null,
          variant_id: item.variant_id || null,
          sku: skuVal,
          product_title: item.title || item.product_title || 'Ordered Product',
          color: item.color || item.selectedColor || null,
          size: item.size || item.selectedSize || null,
          quantity: qty,
          original_price: originalMRP,
          discount_percentage: discountPct,
          discount: itemDiscountPerUnit,
          taxable_amount: taxablePrice,
          gst_rate: gstRate,
          gst_amount: itemTaxPerUnit,
          unit_price: finalSellingPrice,
          subtotal: finalSellingPrice * qty,
          image_url: item.image || item.image_url || null,
        };
      });

      console.log(`🛍️ [ORDER_ITEMS TABLE UPDATE PAYLOAD (Order ID: ${id})]:\n`, JSON.stringify(itemsToInsert, null, 2));

      if (itemsToInsert.length > 0) {
        await supabase.from('order_items').insert(itemsToInsert);
      }
    } catch (err: any) {
      console.error('Error updating order items:', err);
    }
  }

  const { data: updatedOrder } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  return NextResponse.json(updatedOrder || { success: true });
}

/** DELETE /api/orders/:id — delete order (Admin Only) */
export async function DELETE(_: Request, { params }: { params: Params }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const session = await verifySession(sessionCookie);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await supabase.from('order_items').delete().eq('order_id', id);
  } catch {
    /* ignore */
  }

  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, message: 'Order deleted successfully' });
}
