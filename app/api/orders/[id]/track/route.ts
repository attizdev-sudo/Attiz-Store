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

    // 1. Fetch only tracking identifiers from Supabase (fast, no heavy joins)
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, user_id, status, shiprocket_order_id, shiprocket_shipment_id, awb_code, courier_name, tracking_url, edd, payment_status')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (session.role !== 'admin' && order.user_id !== session.id) {
      return NextResponse.json({ error: 'Forbidden. Access denied.' }, { status: 403 });
    }

    // Check if live tracking from Shiprocket API is temporarily disabled
    if (process.env.ENABLE_SHIPROCKET_TRACKING === 'false') {
      return NextResponse.json({
        success: true,
        status: order.status,
        edd: order.edd || null,
        courier_name: order.courier_name || null,
        awb_code: order.awb_code || null,
        tracking_url: order.tracking_url || null,
        tracking: {
          success: true,
          disabled: true,
          current_status: order.status,
          internal_status: order.status,
          courier_name: order.courier_name || null,
          awb_code: order.awb_code || null,
          tracking_url: order.tracking_url || null,
          edd: order.edd || null,
          activities: [],
          is_manual: true,
        },
      });
    }

    // 2. Fetch live tracking info from Shiprocket
    const trackingRes = await trackShiprocketOrder({
      orderId: order.shiprocket_order_id || undefined,
      shipmentId: order.shiprocket_shipment_id || undefined,
      awbCode: order.awb_code || undefined,
      orderNumber: id,
    });

    // 3. If Shiprocket returned updated status, sync only changed columns to Supabase
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
      if (trackingRes.edd && trackingRes.edd !== order.edd) {
        updates.edd = trackingRes.edd;
        hasChanges = true;
      }
      if (trackingRes.internal_status === 'Delivered' && order.payment_status !== 'Paid') {
        updates.payment_status = 'Paid';
        hasChanges = true;
      }

      if (hasChanges) {
        const { error: updateErr } = await supabase
          .from('orders')
          .update(updates)
          .eq('id', id);

        // Fallback if edd column not present in schema
        if (updateErr && updates.edd && updateErr.message?.includes('edd')) {
          const { edd: _omitted, ...safeUpdates } = updates;
          await supabase.from('orders').update(safeUpdates).eq('id', id);
        }
      }
    }

    // Return only the tracking data
    return NextResponse.json({
      success: true,
      status: trackingRes.internal_status || order.status,
      edd: trackingRes.edd || order.edd || null,
      courier_name: trackingRes.courier_name || order.courier_name || null,
      awb_code: trackingRes.awb_code || order.awb_code || null,
      tracking_url: trackingRes.tracking_url || order.tracking_url || null,
      tracking: trackingRes,
    });
  } catch (err: any) {
    console.error('❌ [ORDER TRACKING ERROR]', err);
    return NextResponse.json({ error: err.message || 'Failed to track order.' }, { status: 500 });
  }
}
