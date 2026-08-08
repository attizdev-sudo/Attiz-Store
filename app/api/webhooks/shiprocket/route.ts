import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * POST /api/webhooks/shiprocket
 * Receives real-time shipment status callbacks from Shiprocket
 * and automatically updates order status in Supabase.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log('📦 [SHIPROCKET WEBHOOK RECEIVED]', JSON.stringify(payload));

    const orderIdentifier = payload.order_id || payload.order_number;
    const currentStatus = payload.current_status || payload.status;
    const awb = payload.awb || payload.awb_code;
    const courierName = payload.courier_name || payload.courier;

    if (!orderIdentifier) {
      return NextResponse.json({ error: 'Order identifier missing in webhook payload.' }, { status: 400 });
    }

    // Map Shiprocket status to ATTIZ internal status
    let internalStatus: string | null = null;
    const statusUpper = (currentStatus || '').toUpperCase().trim();

    if (statusUpper.includes('DELIVERED')) {
      internalStatus = 'Delivered';
    } else if (statusUpper.includes('OUT FOR DELIVERY')) {
      internalStatus = 'Out for Delivery';
    } else if (statusUpper.includes('TRANSIT') || statusUpper.includes('SHIPPED') || statusUpper.includes('DISPATCHED')) {
      internalStatus = 'Shipped';
    } else if (statusUpper.includes('PICKUP') || statusUpper.includes('PACKED') || statusUpper.includes('ASSIGNED')) {
      internalStatus = 'Packed';
    } else if (statusUpper.includes('CANCEL')) {
      internalStatus = 'Cancelled';
    } else if (statusUpper.includes('RTO') || statusUpper.includes('RETURN')) {
      internalStatus = 'Returned';
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (internalStatus) updates.status = internalStatus;
    if (awb) updates.awb_code = awb;
    if (courierName) updates.courier_name = courierName;
    if (payload.tracking_url) updates.tracking_url = payload.tracking_url;

    // Automatically mark payment status as Paid if Delivered via COD
    if (internalStatus === 'Delivered') {
      updates.payment_status = 'Paid';
    }

    // Try matching order by order_number first, fallback to id
    let { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('order_number', orderIdentifier);

    if (error) {
      const { error: idErr } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderIdentifier);
      if (idErr) {
        console.error('❌ [SHIPROCKET WEBHOOK UPDATE FAILED]', idErr);
        return NextResponse.json({ error: idErr.message }, { status: 500 });
      }
    }

    console.log(`✅ [SHIPROCKET WEBHOOK UPDATED ORDER ${orderIdentifier}] Status: ${internalStatus || currentStatus}`);
    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (err: any) {
    console.error('❌ [SHIPROCKET WEBHOOK ERROR]', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
