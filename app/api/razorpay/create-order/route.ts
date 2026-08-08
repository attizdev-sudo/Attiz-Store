import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/auth/session';
import { getRazorpayInstance, isRazorpayConfigured } from '@/lib/razorpay';

export async function POST(request: Request) {
  if (!isRazorpayConfigured) {
    return NextResponse.json(
      { error: 'Razorpay is not configured on the server. Missing API Keys.' },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('attiz_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  const sessionData = await validateSession(sessionCookie);
  if (!sessionData) {
    return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
  }

  let body: { amount: number; notes?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { amount, notes } = body;
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Invalid order amount.' }, { status: 400 });
  }

  try {
    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(amount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `ATZ-RZP-${Date.now().toString().slice(-8)}`,
      notes: {
        userId: sessionData.user.id,
        userEmail: sessionData.user.email || '',
        ...notes,
      },
    });

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
    });
  } catch (err: any) {
    console.error('❌ [RAZORPAY CREATE ORDER ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create Razorpay payment order.' },
      { status: 500 }
    );
  }
}
