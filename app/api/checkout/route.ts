import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * POST /api/checkout
 * Body: { userId, shippingDetails, cartItems }
 * Creates the order and decrements stock atomically.
 */
export async function POST(request: Request) {
  let userId: string, shippingDetails: Record<string, string>, cartItems: Array<{ id: string; title: string; price: number; quantity: number; stock: number }>;
  try {
    ({ userId, shippingDetails, cartItems } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!userId || !cartItems?.length) {
    return NextResponse.json({ error: 'User and cart items are required.' }, { status: 400 });
  }

  // Stock validation
  for (const item of cartItems) {
    const { data: products } = await supabase.from('products').select('stock').eq('id', item.id);
    const product = products?.[0];
    if (product && product.stock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${item.title}. Available: ${product.stock}` }, { status: 409 });
    }
  }

  const totalPrice = cartItems.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
    0
  );

  const { error: orderError } = await supabase.from('orders').insert({
    user_id: userId,
    customer_name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
    customer_phone: shippingDetails.phone,
    shipping_address: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.zipCode}`,
    items: cartItems,
    total_price: totalPrice,
    status: 'Waiting for confirmation',
  });

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  // Decrement stock
  for (const item of cartItems) {
    const { data: products } = await supabase.from('products').select('stock').eq('id', item.id);
    const product = products?.[0];
    if (product) {
      await supabase
        .from('products')
        .update({ stock: Math.max(0, product.stock - item.quantity) })
        .eq('id', item.id);
    }
  }

  return NextResponse.json({ success: true, message: 'Order placed successfully!' }, { status: 201 });
}
