import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { validateSession } from '@/lib/auth/session';
import { createShiprocketOrder } from '@/lib/shiprocket';

/**
 * POST /api/admin/shiprocket/push
 * Admin endpoint to manually push an existing order to Shiprocket.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const sessionData = await validateSession(sessionCookie);
  if (!sessionData || sessionData.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
  }

  let body: { orderId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const { orderId } = body;
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
  }

  // Fetch full order data from Supabase
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*), users(email)')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: error?.message || 'Order not found.' }, { status: 404 });
  }

  const rawItems = order.order_items || order.items || [];
  const variantIds = rawItems.map((i: any) => i.variant_id).filter(Boolean);

  let variantSkuMap: Record<string, string> = {};
  let variantGstMap: Record<string, number> = {};
  let variantDiscountMap: Record<string, number> = {};
  let variantPriceMap: Record<string, number> = {};
  if (variantIds.length > 0) {
    const { data: vData } = await supabase
      .from('product_variants')
      .select('id, sku, gst_rate, discount, price')
      .in('id', variantIds);
    if (vData) {
      vData.forEach((v: any) => {
        if (v.sku) variantSkuMap[v.id] = v.sku;
        if (v.gst_rate) variantGstMap[v.id] = v.gst_rate;
        if (v.discount) variantDiscountMap[v.id] = v.discount;
        if (v.price) variantPriceMap[v.id] = v.price;
      });
    }
  }

  const items = rawItems.map((item: any) => {
    const matchedSku = item.sku || (item.variant_id ? variantSkuMap[item.variant_id] : null);
    const matchedGst = item.gst_rate || item.tax || (item.variant_id ? variantGstMap[item.variant_id] : 0);
    
    const originalMrp = item.original_mrp || (item.variant_id ? variantPriceMap[item.variant_id] : 0) || Number(item.unit_price || item.price || 0);
    const discountPct = (item.discount !== undefined && Number(item.discount) > 0)
      ? Number(item.discount)
      : (item.variant_id ? variantDiscountMap[item.variant_id] || 0 : 0);

    const discountAmount = (discountPct > 0 && originalMrp > 0)
      ? Math.round(originalMrp * (discountPct / 100))
      : 0;

    return {
      title: item.product_title || item.title || 'Product',
      quantity: item.quantity || 1,
      sku: matchedSku || undefined,
      price: Number(item.unit_price || item.price || 0),
      discount: discountAmount,
      gst_rate: matchedGst,
    };
  });

  const address1 = order.shipping_address1 || order.shipping_address || 'Address';

  const srRes = await createShiprocketOrder({
    orderId: order.id,
    orderNumber: order.order_number || order.id,
    orderDate: order.created_at,
    customerName: order.shipping_name,
    customerPhone: order.shipping_phone ,
    customerEmail: (order as any).users?.email ,
    shippingAddress1: address1,
    shippingAddress2: order.shipping_address2 || '',
    city: order.shipping_city,
    state: order.shipping_state,
    postalCode: order.shipping_postal_code,
    country: order.shipping_country || 'India',
    paymentMethod: order.payment_status === 'Pending' ? 'COD' : 'Prepaid',
    subtotal: Number(order.subtotal || order.total_price) || 0,
    totalPrice: Number(order.total_price) || 0,
    items,
  });

  if (!srRes.success) {
    return NextResponse.json({ error: srRes.error || 'Failed to push order to Shiprocket.' }, { status: 400 });
  }

  // Update order in Supabase with Shiprocket IDs
  const srUpdates: Record<string, any> = {
    shiprocket_order_id: srRes.shiprocket_order_id,
    shiprocket_shipment_id: srRes.shiprocket_shipment_id,
    updated_at: new Date().toISOString(),
  };
  if (srRes.awb_code) srUpdates.awb_code = srRes.awb_code;

  await supabase.from('orders').update(srUpdates).eq('id', order.id);

  return NextResponse.json({
    success: true,
    message: 'Order pushed to Shiprocket successfully!',
    shiprocket: srRes,
  });
}
