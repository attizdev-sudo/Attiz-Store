import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { validateSession } from '@/lib/auth/session';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { sendOrderConfirmationEmail } from '@/lib/order-emails';

interface VerifyBody {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: string;
  phone?: string;
  updateUserPhone?: boolean;
  saveAddress?: boolean;
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
    gst_rate?: number;
    tax?: number;
  }>;
  pricing?: {
    subtotal?: number;
    shippingCharge?: number;
    discount?: number;
    tax?: number;
    totalPrice?: number;
  };
}

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

  let body: VerifyBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    userId,
    phone: contactPhone,
    updateUserPhone = true,
    saveAddress = false,
    shippingDetails,
    cartItems,
    pricing,
  } = body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: 'Razorpay payment verification parameters missing.' }, { status: 400 });
  }

  if (!userId || !cartItems?.length || !shippingDetails) {
    return NextResponse.json({ error: 'Shipping details and cart items are required.' }, { status: 400 });
  }

  // Security check: user must match session unless admin
  if (user.role !== 'admin' && userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden. Session mismatch.' }, { status: 403 });
  }

  // 1. VERIFY HMAC SIGNATURE
  const isValidSignature = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValidSignature) {
    console.error('❌ [RAZORPAY VERIFY FAILED] Invalid payment signature:', { razorpayOrderId, razorpayPaymentId });
    return NextResponse.json({ error: 'Payment verification failed. Invalid signature.' }, { status: 400 });
  }

  const recipientName = shippingDetails.recipientName?.trim();
  const shippingPhone = shippingDetails.phone?.trim();
  const address1 = (shippingDetails.addressLine1 || shippingDetails.address || '').trim();
  const address2 = (shippingDetails.addressLine2 || '').trim();
  const city = shippingDetails.city?.trim();
  const state = shippingDetails.state?.trim();
  const postalCode = shippingDetails.postalCode?.trim();
  const country = (shippingDetails.country || 'India').trim();

  // 2. UPDATE USER'S PHONE IN `users` TABLE IF PROVIDED & CHANGED
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
      console.warn('Failed to update phone in users table during online checkout:', err);
    }
  }

  // 3. SAVE OR UPDATE ADDRESS IN `addresses` TABLE
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

  // 3. FETCH VARIANT DETAILS (sku, gst_rate, discount, price) FROM `product_variants` TABLE
  const variantIds = cartItems.map((ci) => ci.variant_id).filter(Boolean);
  let variantMap: Record<string, { sku?: string; gst_rate: number; discount: number; price: number }> = {};

  if (variantIds.length > 0) {
    const { data: vData } = await supabase
      .from('product_variants')
      .select('id, sku, gst_rate, discount, price')
      .in('id', variantIds);

    if (vData) {
      vData.forEach((v: any) => {
        variantMap[v.id] = {
          sku: v.sku || undefined,
          gst_rate: v.gst_rate !== null && v.gst_rate !== undefined ? Number(v.gst_rate) : 0,
          discount: v.discount !== null && v.discount !== undefined ? Number(v.discount) : 0,
          price: v.price !== null && v.price !== undefined ? Number(v.price) : 0,
        };
      });
    }
  }

  // Calculate item breakdown, total discount, and total tax
  let calculatedSubtotal = 0;
  let calculatedTotalDiscount = 0;
  let calculatedTotalTax = 0;

  const orderItemsData = cartItems.map((item) => {
    const vInfo = item.variant_id ? variantMap[item.variant_id] : null;
    const finalSellingPrice = Number(item.price) || (vInfo?.price ? Math.round(vInfo.price * (1 - (vInfo.discount || 0) / 100) * (1 + (vInfo.gst_rate || 5) / 100)) : 0);
    const qty = item.quantity || 1;

    const itemGst = (item as any).gst_rate ?? (item as any).tax;
    const gstRate = (itemGst !== undefined && itemGst !== null && Number(itemGst) > 0)
      ? Number(itemGst)
      : (vInfo?.gst_rate || (finalSellingPrice > 2500 ? 18 : 5));

    const discountPct = (item.discount !== undefined && item.discount !== null && Number(item.discount) > 0)
      ? Number(item.discount)
      : (vInfo?.discount || 0);

    // Step 3 in waterfall: Taxable Base Price = Final Selling Price / (1 + GST%)
    const taxablePrice = gstRate > 0 ? Math.round(finalSellingPrice / (1 + gstRate / 100)) : finalSellingPrice;

    // Step 1 in waterfall: Original MRP (from vInfo.price or calculated from taxable price)
    const originalMRP = (vInfo?.price && vInfo.price > taxablePrice)
      ? vInfo.price
      : (discountPct > 0 ? Math.round(taxablePrice / (1 - discountPct / 100)) : finalSellingPrice);

    // Step 2 in waterfall: Discount Amount = Original MRP * discountPct% (e.g. 752 * 25% = 188)
    const itemDiscountPerUnit = (vInfo?.price && discountPct > 0)
      ? Math.round(vInfo.price * (discountPct / 100))
      : Math.max(0, originalMRP - taxablePrice);

    // Step 4 in waterfall: GST Tax Amount = Final Selling Price - Taxable Base Price (e.g. 592 - 564 = 28)
    const itemTaxPerUnit = Math.max(0, finalSellingPrice - taxablePrice);

    const itemSubtotal = finalSellingPrice * qty;
    const itemTotalDiscount = itemDiscountPerUnit * qty;
    const itemTotalTax = itemTaxPerUnit * qty;

    calculatedSubtotal += itemSubtotal;
    calculatedTotalDiscount += itemTotalDiscount;
    calculatedTotalTax += itemTotalTax;

    const cleanProdId = item.product_id || (item.id.includes('-') ? item.id.split('-')[0] : item.id);

    return {
      order_id: '',
      product_id: cleanProdId,
      variant_id: item.variant_id || null,
      sku: (item as any).sku || vInfo?.sku || null,
      product_title: item.title || 'Product',
      color: item.color || (item as any).selectedColor || null,
      size: item.selectedSize || item.size || null,
      quantity: qty,
      original_price: originalMRP,
      discount_percentage: discountPct,
      discount: itemDiscountPerUnit,
      taxable_amount: taxablePrice,
      gst_rate: gstRate,
      gst_amount: itemTaxPerUnit,
      unit_price: finalSellingPrice,
      subtotal: itemSubtotal,
      image_url: item.image || null,
    };
  });

  const finalSubtotal = pricing?.subtotal ?? calculatedSubtotal;
  const shippingCharge = pricing?.shippingCharge ?? 0;
  const finalDiscount = (pricing?.discount && pricing.discount > 0) ? pricing.discount : calculatedTotalDiscount;
  const finalTax = (pricing?.tax && pricing.tax > 0) ? pricing.tax : calculatedTotalTax;
  const totalPrice = pricing?.totalPrice ?? (finalSubtotal + shippingCharge + finalTax - finalDiscount);

  const orderNumber = `ATZ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 4. CREATE ORDER IN `orders` TABLE (Marked as Paid)
  const orderPayload = {
    user_id: userId,
    order_number: orderNumber,
    subtotal: finalSubtotal,
    shipping_charge: shippingCharge,
    discount: finalDiscount,
    tax: finalTax,
    total_price: totalPrice,
    status: 'Waiting for confirmation',
    payment_status: 'Paid',
    shipping_name: recipientName,
    shipping_phone: shippingPhone,
    shipping_address1: address1,
    shipping_address2: address2 || null,
    shipping_city: city,
    shipping_state: state,
    shipping_country: country,
    shipping_postal_code: postalCode,
  };

  console.log('📦 [RAZORPAY ORDERS TABLE INSERT PAYLOAD]:\n', JSON.stringify(orderPayload, null, 2));

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select('id, order_number')
    .single();

  if (orderError || !orderData) {
    console.error('Order creation failed:', orderError);
    return NextResponse.json({ error: orderError?.message || 'Failed to create order.' }, { status: 500 });
  }

  const orderId = orderData.id;

  // Set order_id on order items and insert into `order_items` TABLE
  const finalOrderItems = orderItemsData.map((oi) => ({ ...oi, order_id: orderId }));

  console.log('🛍️ [RAZORPAY ORDER_ITEMS TABLE INSERT PAYLOAD]:\n', JSON.stringify(finalOrderItems, null, 2));

  const { error: itemsError } = await supabase.from('order_items').insert(finalOrderItems);
  if (itemsError) {
    console.error('Order items insertion error:', itemsError);
  }

  // 6. CREATE PAYMENT RECORD IN `payments` TABLE
  try {
    await supabase.from('payments').insert({
      order_id: orderId,
      provider: 'Razorpay',
      payment_id: razorpayPaymentId,
      status: 'Completed',
      amount: totalPrice,
      currency: 'INR',
      paid_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Razorpay payment record insert warning:', err);
  }

  // 7. AUTOMATIC SHIPROCKET ORDER CREATION (Builds & logs payload; skips HTTP dispatch if ENABLE_SHIPROCKET=false)
  let shiprocketResult: any = null;

  try {
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
      paymentMethod: 'Prepaid',
      subtotal: finalSubtotal,
      totalPrice,
      items: finalOrderItems.map((oi) => ({
        title: oi.product_title,
        sku: oi.sku || undefined,
        quantity: oi.quantity,
        price: oi.unit_price,
        discount: oi.discount,
        gst_rate: oi.gst_rate,
      })),
    });

    if (srRes.success) {
      shiprocketResult = srRes;
      const srUpdates: Record<string, any> = {
        shiprocket_order_id: srRes.shiprocket_order_id,
        shiprocket_shipment_id: srRes.shiprocket_shipment_id,
      };
      if (srRes.awb_code) srUpdates.awb_code = srRes.awb_code;

      await supabase.from('orders').update(srUpdates).eq('id', orderId);
    } else if (srRes.disabled) {
      shiprocketResult = srRes;
    }
  } catch (srErr) {
    console.error('Shiprocket auto-order creation error (non-fatal):', srErr);
  }

  // 8. SEND ORDER CONFIRMATION EMAIL NOTIFICATION TO CUSTOMER
  const customerEmail = user.email || (user as any).user_metadata?.email;
  if (customerEmail) {
    sendOrderConfirmationEmail({
      toEmail: customerEmail,
      customerName: user.first_name || recipientName,
      orderNumber: orderData.order_number,
      orderId,
      orderDate: new Date().toISOString(),
      paymentMethod: 'Prepaid (Razorpay)',
      paymentStatus: 'Paid',
      status: 'Confirmed',
      shippingDetails: {
        recipientName,
        phone: shippingPhone,
        addressLine1: address1,
        addressLine2: address2 || null,
        city,
        state,
        postalCode,
        country,
      },
      items: finalOrderItems.map((oi) => ({
        title: oi.product_title,
        size: oi.size,
        color: oi.color,
        quantity: oi.quantity,
        price: oi.unit_price,
        originalPrice: oi.original_price,
        discount: oi.discount,
        image: oi.image_url,
      })),
      pricing: {
        subtotal: finalSubtotal,
        shippingCharge,
        discount: finalDiscount,
        tax: finalTax,
        totalPrice,
      },
    }).catch((emailErr) => {
      console.error('Non-fatal error sending order confirmation email:', emailErr);
    });
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Razorpay payment verified and order placed successfully!',
      orderNumber: orderData.order_number,
      orderId,
      shiprocket: shiprocketResult,
    },
    { status: 201 }
  );
}
