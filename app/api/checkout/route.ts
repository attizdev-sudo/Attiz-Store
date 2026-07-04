import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/session';

interface CheckoutBody {
  userId: string;
  shippingDetails: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  cartItems: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    selectedSize?: string;
  }>;
}

/**
 * POST /api/checkout
 * Body: { userId, shippingDetails, cartItems }
 * Creates the order and decrements stock atomically using database RPC.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const session = await verifySession(sessionCookie);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
  }

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { userId, shippingDetails, cartItems } = body;

  if (!userId || !cartItems?.length || !shippingDetails) {
    return NextResponse.json({ error: 'User details, shipping details and cart items are required.' }, { status: 400 });
  }

  // Prevent ordering on behalf of other users
  if (session.role !== 'admin' && userId !== session.id) {
    return NextResponse.json({ error: 'Forbidden. User ID mismatch.' }, { status: 403 });
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Invoke atomic stored transaction on database side
  const { data, error: rpcError } = await supabase.rpc('process_checkout', {
    user_id_param: userId,
    customer_name_param: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
    customer_phone_param: shippingDetails.phone,
    shipping_address_param: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.zipCode}`,
    items_param: cartItems,
    total_price_param: totalPrice,
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  // Check custom validation returned from the stored procedure
  if (data && typeof data === 'object' && 'success' in data && !data.success) {
    return NextResponse.json({ error: data.error || 'Checkout failed.' }, { status: 409 });
  }

  return NextResponse.json({ success: true, message: 'Order placed successfully!' }, { status: 201 });
}

