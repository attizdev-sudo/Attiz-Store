import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { validateSession } from '@/lib/auth/session';
import { createShiprocketOrder } from '@/lib/shiprocket';

interface CheckoutBody {
  userId: string;
  phone?: string;
  updateUserPhone?: boolean;
  saveAddress?: boolean;
  paymentMethod?: string;
  shippingDetails: {
    recipientName: string;
    phone: string;
    address?: string;
    addressLine1?: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  cartItems: Array<{
    id: string;
    product_id?: string;
    variant_id?: string;
    title: string;
    price: number;
    quantity: number;
    selectedSize?: string;
    size?: string;
    color?: string;
    image?: string;
    discount?: number;
  }>;
  pricing?: {
    subtotal?: number;
    shippingCharge?: number;
    discount?: number;
    tax?: number;
    totalPrice?: number;
  };
}

/**
 * POST /api/checkout
 * Processes order placement, updates user phone in `users` table,
 * saves shipping address in `addresses` table, and creates order, order items, and payment records.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in to place an order.' }, { status: 401 });
  }

  const sessionData = await validateSession(sessionCookie);
  if (!sessionData) {
    return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
  }
  const { user } = sessionData;

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const { userId, phone: contactPhone, updateUserPhone = true, saveAddress = false, paymentMethod = 'COD', shippingDetails, cartItems, pricing } = body;

  if (!userId || !cartItems?.length || !shippingDetails) {
    return NextResponse.json({ error: 'User details, shipping details and cart items are required.' }, { status: 400 });
  }

  // Security check: user must match session unless admin
  if (user.role !== 'admin' && userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden. Session mismatch.' }, { status: 403 });
  }

  const recipientName = shippingDetails.recipientName?.trim();
  const shippingPhone = shippingDetails.phone?.trim();
  const address1 = (shippingDetails.addressLine1 || shippingDetails.address || '').trim();
  const address2 = (shippingDetails.addressLine2 || '').trim();
  const city = shippingDetails.city?.trim();
  const state = shippingDetails.state?.trim();
  const postalCode = shippingDetails.postalCode?.trim();
  const country = (shippingDetails.country || 'India').trim();

  if (!recipientName || !shippingPhone || !address1 || !city || !state || !postalCode || !country) {
    return NextResponse.json({ error: 'Please provide all required shipping fields.' }, { status: 400 });
  }

  if (recipientName.length < 3) {
    return NextResponse.json({ error: 'Recipient name must be at least 3 characters long.' }, { status: 400 });
  }

  const cleanPhoneNum = shippingPhone.replace(/\D/g, '').slice(-10);
  if (cleanPhoneNum.length < 10 || !/^[6-9]\d{9}$/.test(cleanPhoneNum)) {
    return NextResponse.json({ error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' }, { status: 400 });
  }

  if (!/^\d{6}$/.test(postalCode.replace(/\D/g, ''))) {
    return NextResponse.json({ error: 'PIN code must be a valid 6-digit number.' }, { status: 400 });
  }

  if (address1.length < 10) {
    return NextResponse.json({ error: 'Street address line 1 must be at least 10 characters long (include house/flat no., street, and area) for courier shipping.' }, { status: 400 });
  }

  // 1. UPDATE USER'S PHONE IN `users` TABLE IF PROVIDED & CHANGED
  const finalPhone = contactPhone?.trim() || shippingPhone;
  if (finalPhone && updateUserPhone) {
    try {
      await supabase
        .from('users')
        .update({
          phone: finalPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch (err) {
      console.warn('Failed to update phone in users table during checkout:', err);
    }
  }

  // 2. SAVE OR UPDATE ADDRESS IN `addresses` TABLE
  try {
    const { count } = await supabase
      .from('addresses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (saveAddress || count === 0) {
      const isDefault = count === 0;
      if (isDefault) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
      }
      await supabase.from('addresses').insert({
        user_id: userId,
        recipient_name: recipientName,
        phone: shippingPhone,
        address_line1: address1,
        address_line2: address2 || null,
        city,
        state,
        country,
        postal_code: postalCode,
        is_default: isDefault,
      });
    }
  } catch (err) {
    console.warn('Address saving skipped/failed:', err);
  }

  // Compute pricing breakdown
  const subtotal = pricing?.subtotal ?? cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  const shippingCharge = pricing?.shippingCharge ?? (subtotal >= 999 ? 0 : 99);
  const discount = pricing?.discount ?? 0;
  const tax = pricing?.tax ?? 0;
  const totalPrice = pricing?.totalPrice ?? (subtotal + shippingCharge + tax - discount);

  const orderNumber = `ATZ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 3. CREATE ORDER IN `orders` TABLE
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: orderNumber,
      subtotal,
      shipping_charge: shippingCharge,
      discount,
      tax,
      total_price: totalPrice,
      status: 'Waiting for confirmation',
      payment_status: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      shipping_name: recipientName,
      shipping_phone: shippingPhone,
      shipping_address1: address1,
      shipping_address2: address2 || null,
      shipping_city: city,
      shipping_state: state,
      shipping_country: country,
      shipping_postal_code: postalCode,
    })
    .select('id, order_number')
    .single();

  if (orderError || !orderData) {
    console.error('Order creation failed:', orderError);
    return NextResponse.json({ error: orderError?.message || 'Failed to create order.' }, { status: 500 });
  }

  const orderId = orderData.id;

  // 4. CREATE ORDER ITEMS IN `order_items` TABLE
  const orderItemsData = cartItems.map((item) => {
    const itemPrice = Number(item.price) || 0;
    const qty = item.quantity || 1;
    const cleanProdId = item.product_id || (item.id.includes('-') ? item.id.split('-')[0] : item.id);
    return {
      order_id: orderId,
      product_id: cleanProdId,
      variant_id: item.variant_id || null,
      sku: (item as any).sku || null,
      product_title: item.title || 'Product',
      color: item.color || (item as any).selectedColor || null,
      size: item.selectedSize || item.size || null,
      quantity: qty,
      unit_price: itemPrice,
      discount: item.discount || 0,
      subtotal: itemPrice * qty,
      image_url: item.image || null,
    };
  });

  console.log('🛍️ [CHECKOUT API] Data sent to `order_items` table:', orderItemsData);

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
  if (itemsError) {
    console.error('Order items insertion error:', itemsError);
    // Non-fatal if order created, but log error
  }

  // 5. CREATE PAYMENT RECORD IN `payments` TABLE
  try {
    await supabase.from('payments').insert({
      order_id: orderId,
      provider: paymentMethod,
      payment_id: `PAY-${Date.now().toString().slice(-8)}`,
      status: paymentMethod === 'COD' ? 'Pending' : 'Completed',
      amount: totalPrice,
      currency: 'INR',
      paid_at: paymentMethod === 'COD' ? null : new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Payment record insert warning:', err);
  }

  // 6. AUTOMATIC SHIPROCKET ORDER CREATION IF CREDENTIALS PRESENT AND ENABLED
  let shiprocketResult: any = null;
  const isShiprocketEnabled = process.env.ENABLE_SHIPROCKET !== 'false';

  if (isShiprocketEnabled && process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) {
    try {
      const variantIds = cartItems.map((ci) => ci.variant_id).filter(Boolean);
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

      const srRes = await createShiprocketOrder({
        orderId,
        orderNumber: orderData.order_number || orderId,
        orderDate: new Date().toISOString(),
        customerName: recipientName,
        customerPhone: shippingPhone,
        customerEmail: user.email || '',
        shippingAddress1: address1,
        shippingAddress2: address2 || '',
        city,
        state,
        postalCode,
        country,
        paymentMethod,
        subtotal,
        totalPrice,
        items: cartItems.map((ci) => {
          const matchedSku = (ci as any).sku || (ci.variant_id ? variantSkuMap[ci.variant_id] : null);
          const matchedGst = (ci as any).gst_rate || (ci.variant_id ? variantGstMap[ci.variant_id] : 0);
          
          const originalMrp = (ci as any).original_mrp || (ci.variant_id ? variantPriceMap[ci.variant_id] : 0) || Number(ci.price) || 0;
          const discountPct = (ci.discount !== undefined && Number(ci.discount) > 0)
            ? Number(ci.discount)
            : (ci.variant_id ? variantDiscountMap[ci.variant_id] || 0 : 0);

          const discountAmount = (discountPct > 0 && originalMrp > 0)
            ? Math.round(originalMrp * (discountPct / 100))
            : 0;

          return {
            title: ci.title || 'Product',
            sku: matchedSku || undefined,
            quantity: ci.quantity || 1,
            price: Number(ci.price) || 0,
            discount: discountAmount,
            gst_rate: matchedGst,
          };
        }),
      });

      if (srRes.success) {
        shiprocketResult = srRes;
        const srUpdates: Record<string, any> = {
          shiprocket_order_id: srRes.shiprocket_order_id,
          shiprocket_shipment_id: srRes.shiprocket_shipment_id,
        };
        if (srRes.awb_code) srUpdates.awb_code = srRes.awb_code;

        await supabase.from('orders').update(srUpdates).eq('id', orderId);
      }
    } catch (srErr) {
      console.error('Shiprocket auto-order creation error (non-fatal):', srErr);
    }
  } else if (!isShiprocketEnabled) {
    console.log('ℹ️ [CHECKOUT API] Shiprocket order creation skipped (ENABLE_SHIPROCKET is set to false).');
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Order placed successfully!',
      orderNumber: orderData.order_number,
      orderId,
      shiprocket: shiprocketResult,
    },
    { status: 201 }
  );
}
