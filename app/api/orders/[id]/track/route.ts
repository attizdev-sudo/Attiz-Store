import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { verifySession } from '@/lib/session';
import { trackShiprocketOrder } from '@/lib/shiprocket';

type Params = Promise<{ id: string }>;

/**
 * GET /api/orders/[id]/track
 * Fetches real-time tracking data from Shiprocket,
 * automatically updates status/AWB/courier in Supabase,
 * and returns refreshed order + live tracking activity checkpoints.
 */
export async function GET(_: Request, { params }: { params: Params }) {
  try {
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

    // 1. Fetch current order details from Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*), payments(*)')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (session.role !== 'admin' && order.user_id !== session.id) {
      return NextResponse.json({ error: 'Forbidden. Access denied.' }, { status: 403 });
    }

    // 2. Fetch live tracking info from Shiprocket
    const trackingRes = await trackShiprocketOrder({
      orderId: order.shiprocket_order_id || undefined,
      shipmentId: order.shiprocket_shipment_id || undefined,
      awbCode: order.awb_code || undefined,
      orderNumber: order.order_number || undefined,
    });

    let currentOrder = order;

    // 3. If Shiprocket returned updated tracking info, sync to Supabase database
    if (trackingRes.success && trackingRes.internal_status) {
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      let hasChanges = false;

      if (trackingRes.internal_status && trackingRes.internal_status !== order.status) {
        updates.status = trackingRes.internal_status;
        hasChanges = true;
      }
      if (trackingRes.awb_code && trackingRes.awb_code !== order.awb_code) {
        updates.awb_code = trackingRes.awb_code;
        hasChanges = true;
      }
      if (trackingRes.courier_name && trackingRes.courier_name !== order.courier_name) {
        updates.courier_name = trackingRes.courier_name;
        hasChanges = true;
      }
      if (trackingRes.tracking_url && trackingRes.tracking_url !== order.tracking_url) {
        updates.tracking_url = trackingRes.tracking_url;
        hasChanges = true;
      }

      if (trackingRes.internal_status === 'Delivered' && order.payment_status !== 'Paid') {
        updates.payment_status = 'Paid';
        hasChanges = true;
      }

      if (hasChanges) {
        console.log(`🔄 [AUTO-SYNC SHIPROCKET STATUS] Order ${id} updated:`, updates);
        const { data: updatedOrder } = await supabase
          .from('orders')
          .update(updates)
          .eq('id', id)
          .select('*, order_items(*), payments(*)')
          .single();

        if (updatedOrder) {
          currentOrder = updatedOrder;
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: currentOrder,
      tracking: trackingRes,
    });
  } catch (err: any) {
    console.error('❌ [ORDER TRACKING ERROR]', err);
    return NextResponse.json({ error: err.message || 'Failed to track order.' }, { status: 500 });
  }
}
