import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/session';
import { sendOrderConfirmationEmail } from '@/lib/order-emails';

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
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  if (session.role !== 'admin' && order.user_id !== session.id) {
    return NextResponse.json({ error: 'Forbidden. Access denied.' }, { status: 403 });
  }

  const paidAmount = Array.isArray(order.payments) && order.payments.length > 0
    ? Number(order.payments[0].amount || 0)
    : Number(order.total_price || 0);

  return NextResponse.json({
    ...order,
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
    .select('*, order_items(*), users(id, email, first_name, last_name, phone)')
    .eq('id', id)
    .single();

  // If status is updated to 'Confirmed', notify customer via email
  if (orderUpdates.status === 'Confirmed' && updatedOrder) {
    const customerEmail = updatedOrder.users?.email;
    if (customerEmail) {
      const itemsList = Array.isArray(updatedOrder.order_items)
        ? updatedOrder.order_items.map((oi: any) => ({
            title: oi.product_title || 'Ordered Product',
            size: oi.size,
            color: oi.color,
            quantity: oi.quantity || 1,
            price: Number(oi.unit_price || oi.price || 0),
            originalPrice: Number(oi.original_price || oi.price || 0),
            discount: Number(oi.discount || 0),
            image: oi.image_url,
          }))
        : [];

      sendOrderConfirmationEmail({
        toEmail: customerEmail,
        customerName: updatedOrder.users?.first_name || updatedOrder.shipping_name || 'Customer',
        orderNumber: updatedOrder.order_number || `ATZ-${id.slice(-6)}`,
        orderId: updatedOrder.id,
        orderDate: updatedOrder.created_at,
        paymentMethod: updatedOrder.payment_status === 'Paid' ? 'Prepaid (Online)' : 'Cash on Delivery',
        paymentStatus: updatedOrder.payment_status || 'Pending',
        status: 'Confirmed',
        shippingDetails: {
          recipientName: updatedOrder.shipping_name || updatedOrder.users?.first_name || 'Customer',
          phone: updatedOrder.shipping_phone || updatedOrder.users?.phone || '',
          addressLine1: updatedOrder.shipping_address1 || updatedOrder.shipping_address || '',
          addressLine2: updatedOrder.shipping_address2 || null,
          city: updatedOrder.shipping_city || '',
          state: updatedOrder.shipping_state || '',
          postalCode: updatedOrder.shipping_postal_code || '',
          country: updatedOrder.shipping_country || 'India',
        },
        items: itemsList,
        pricing: {
          subtotal: Number(updatedOrder.subtotal || updatedOrder.total_price || 0),
          shippingCharge: Number(updatedOrder.shipping_charge || 0),
          discount: Number(updatedOrder.discount || 0),
          tax: Number(updatedOrder.tax || 0),
          totalPrice: Number(updatedOrder.total_price || 0),
        },
      }).catch((emailErr) => {
        console.error('Non-fatal error sending status confirmed email:', emailErr);
      });
    }
  }

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
