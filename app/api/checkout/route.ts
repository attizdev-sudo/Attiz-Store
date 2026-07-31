import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { validateSession } from '@/lib/auth/session';

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

  return NextResponse.json(
    {
      success: true,
      message: 'Order placed successfully!',
      orderNumber: orderData.order_number,
      orderId,
    },
    { status: 201 }
  );
}
