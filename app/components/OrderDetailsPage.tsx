'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  X,
  ExternalLink,
  Phone,
  User,
  RotateCw,
  Check,
  ArrowUpRight,
  Printer,
  CreditCard,
  AlertCircle,
  HelpCircle,
  Banknote,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { handlePrintInvoice } from '@/lib/invoice';
import { getExpectedDeliveryInfo } from '@/lib/orders';
import AttizLoader from '@/app/components/AttizLoader';
import type { CartItem } from '@/lib/types';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';

const TRACKING_STEPS = [
  { id: 1, key: 'Confirmed', title: 'Confirmed', desc: 'Order Placed', icon: ClipboardList },
  { id: 2, key: 'Packed', title: 'Packed', desc: 'Ready to Ship', icon: Package },
  { id: 3, key: 'Dispatched', title: 'Dispatched', desc: 'With Courier', icon: ArrowUpRight },
  { id: 4, key: 'Shipped', title: 'In Transit', desc: 'On the Way', icon: Truck },
  { id: 5, key: 'Delivered', title: 'Delivered', desc: 'Package Received', icon: CheckCircle2 },
];

function getStatusStep(status?: string): { step: number; label: string; isCancelled: boolean } {
  if (!status) return { step: 1, label: 'Order Confirmed', isCancelled: false };
  const clean = String(status).trim().toUpperCase();

  if (clean.includes('DELIVER')) {
    return { step: 5, label: 'Delivered', isCancelled: false };
  }
  if (clean.includes('OUT FOR DELIVERY')) {
    return { step: 4, label: 'Out for Delivery', isCancelled: false };
  }
  if (clean.includes('SHIPPED') || clean.includes('TRANSIT')) {
    return { step: 4, label: 'In Transit', isCancelled: false };
  }
  if (clean.includes('DISPATCH')) {
    return { step: 3, label: 'Dispatched', isCancelled: false };
  }
  if (clean.includes('PACKED') || clean.includes('PICKUP') || clean.includes('MANIFEST')) {
    return { step: 2, label: 'Item Packed', isCancelled: false };
  }
  if (clean.includes('CANCEL')) {
    return { step: 0, label: 'Order Cancelled', isCancelled: true };
  }
  if (clean.includes('RETURN') || clean.includes('RTO')) {
    return { step: 0, label: 'Order Returned', isCancelled: true };
  }

  return { step: 1, label: 'Order Confirmed', isCancelled: false };
}

interface OrderDetailsPageProps {
  orderId?: string;
}

export default function OrderDetailsPage({ orderId: propOrderId }: OrderDetailsPageProps) {
  const router = useRouter();
  const routeParams = useParams();
  const resolvedOrderId = (propOrderId || routeParams?.id) as string;

  const { user, sessionLoading } = useAuth();
  const { orders: storeOrders } = useStore();
  const isAdmin = user?.role === 'admin';

  const [order, setOrder] = useState<any>(null);
  const [liveTracking, setLiveTracking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [trackingFetched, setTrackingFetched] = useState(false);

  const fetchedIdRef = useRef<string | null>(null);

  // Fast loader: loads database order immediately (~30ms) WITHOUT calling Shiprocket
  const loadOrder = useCallback(async (targetId: string) => {
    if (!targetId) return;

    try {
      const orderRes = await fetch(`/api/orders/${encodeURIComponent(targetId)}`, { credentials: 'include' });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrder(orderData);
        setError(null);
        setIsLoading(false);
      } else {
        const errJson = await orderRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to load order');
      }
    } catch (err: any) {
      console.error('Order fetch error:', err);
      if (!order) {
        setError(err.message || 'Order not found or access denied.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [order]);

  // Fetches live Shiprocket tracking strictly on-demand when user clicks "Tracking Details"
  const fetchLiveTrackingDetails = useCallback(async () => {
    const targetId = order?.id || resolvedOrderId;
    if (!targetId) return;

    setIsTrackingLoading(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(targetId)}/track`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.tracking) {
          setLiveTracking(data.tracking);
          setOrder((prev: any) => ({
            ...(prev || {}),
            status: data.status || prev?.status,
            edd: data.edd || prev?.edd,
            courier_name: data.courier_name || prev?.courier_name,
            awb_code: data.awb_code || prev?.awb_code,
            tracking_url: data.tracking_url || prev?.tracking_url,
          }));
          setTrackingFetched(true);
        }
      }
      // Re-fetch fresh order to ensure all fields (status, items, payments) stay in sync with admin updates
      loadOrder(targetId);
    } catch (err) {
      console.error('Error fetching live tracking:', err);
    } finally {
      setIsTrackingLoading(false);
    }
  }, [order?.id, resolvedOrderId, loadOrder]);

  // Instant Hydration from Cache + Silent Fresh Data Fetch
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push(`/login?redirect=/orders/${encodeURIComponent(resolvedOrderId || '')}`);
      return;
    }

    if (!resolvedOrderId) {
      setError('Order ID is missing.');
      setIsLoading(false);
      return;
    }

    // Only run fetch once per orderId to avoid duplicate requests & unwanted re-renders
    if (fetchedIdRef.current !== resolvedOrderId) {
      fetchedIdRef.current = resolvedOrderId;

      // 1. Instant Cache Hydration: if order was cached from /orders page, display it immediately (0ms)
      if (typeof window !== 'undefined') {
        try {
          const cached = sessionStorage.getItem('attiz_user_orders');
          if (cached) {
            const list = JSON.parse(cached);
            const found = list.find((o: any) => o.id === resolvedOrderId || o.order_number === resolvedOrderId);
            if (found) {
              setOrder(found);
              setIsLoading(false);
            }
          }
        } catch {
          /* ignore */
        }
      }

      // Fallback to store context if available
      if (!order && storeOrders && storeOrders.length > 0) {
        const matched = storeOrders.find((o) => o.id === resolvedOrderId || o.order_number === resolvedOrderId);
        if (matched) {
          setOrder(matched);
          setIsLoading(false);
        }
      }

      // 2. Fetch fresh order from database immediately (~30ms, no Shiprocket lag)
      loadOrder(resolvedOrderId);
    }
  }, [resolvedOrderId, user, sessionLoading, router, storeOrders, loadOrder, order]);

  // Normalize items from order.items OR order.order_items
  const rawItems: CartItem[] = useMemo(() => {
    if (!order) return [];
    if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items;
    }
    if (Array.isArray(order.order_items) && order.order_items.length > 0) {
      return order.order_items.map((oi: any) => ({
        id: oi.id,
        product_id: oi.product_id,
        variant_id: oi.variant_id,
        title: oi.product_title || oi.title || 'Product',
        price: Number(oi.unit_price ?? oi.price ?? 0),
        unit_price: Number(oi.unit_price ?? oi.price ?? 0),
        original_price: Number(oi.original_price ?? oi.mrp ?? 0),
        mrp: Number(oi.original_price ?? oi.mrp ?? 0),
        discount: Number(oi.discount ?? 0),
        quantity: Number(oi.quantity || 1),
        selectedSize: oi.size || oi.selectedSize,
        color: oi.color,
        image: oi.image_url || oi.image || DEFAULT_IMAGE,
      }));
    }
    return [];
  }, [order]);

  // Loading state (only shown if no cached order exists yet)
  if (sessionLoading || (isLoading && !order)) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-12 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center py-24">
            <AttizLoader label="Loading Order Details..." />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-12 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/orders"
            className="inline-flex items-center space-x-2 attiz-mono text-xs font-bold uppercase text-black hover:text-[#E63B2E] transition-colors cursor-pointer group mb-6"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to My Orders</span>
          </Link>

          <div className="bg-white border-2 border-black p-8 text-center shadow-[4px_4px_0_0_#111111] space-y-4">
            <AlertCircle className="w-12 h-12 text-[#E63B2E] mx-auto" />
            <h1 className="attiz-display text-2xl uppercase text-black">Order Not Found</h1>
            <p className="attiz-mono text-xs text-black/70 uppercase max-w-md mx-auto">
              {error || "We couldn't find the order you requested, or you might not have permission to view it."}
            </p>
            <div className="pt-2">
              <Link
                href="/orders"
                className="inline-flex items-center space-x-2 py-2.5 px-6 border-2 border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <span>View All Orders</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orderNo = order.order_number || (order.id || '').slice(0, 8).toUpperCase();
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : '';

  const currentStatusInfo = getStatusStep(order.status);
  const currentStep = currentStatusInfo.step;
  const isCancelled = currentStatusInfo.isCancelled;
  const progressPct = isCancelled ? 0 : Math.min(100, Math.max(0, ((currentStep - 1) / (TRACKING_STEPS.length - 1)) * 100));
  const trackProgressPct = isCancelled ? 0 : Math.min(80, Math.max(0, ((currentStep - 1) / (TRACKING_STEPS.length - 1)) * 80));

  const effectiveEdd = order.edd || liveTracking?.edd;
  const expectedInfo = !isCancelled && currentStep !== 5 ? getExpectedDeliveryInfo(order.created_at, effectiveEdd) : null;

  // Price calculations
  const itemsSubtotal = rawItems.reduce((acc, it) => {
    const qty = Number(it.quantity || 1);
    const originalUnit = Number(it.original_price ?? it.mrp ?? it.price ?? it.unit_price ?? 0);
    const unitPrice = originalUnit > 0 ? originalUnit : Number(it.unit_price ?? it.price ?? 0);
    return acc + unitPrice * qty;
  }, 0);

  const discountAmount = Number(order.discount || 0);
  const shippingCharge = Number(order.shipping_charge || 0);
  const grandTotal = Number(order.total_price ?? order.total ?? (itemsSubtotal - discountAmount + shippingCharge));

  const paidAmount = Number(
    order.payments?.[0]?.amount ??
    order.paid_amount ??
    order.amount_paid ??
    (order.payment_status === 'Paid' ? grandTotal : 0)
  );
  const isPartialCod = order.payment_status === 'Pending' && paidAmount > 0;
  const balanceAmount = isPartialCod ? Math.max(0, grandTotal - paidAmount) : 0;

  const activities: any[] = liveTracking?.activities || [];
  const latestActivity = activities.length > 0 ? activities[0] : null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Back Link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="flex items-center space-x-1.5 attiz-mono text-xs font-bold uppercase text-black hover:text-[#E63B2E] transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Admin</span>
                </Link>
                <span className="text-black/30">|</span>
                <Link
                  href="/orders"
                  className="attiz-mono text-xs font-bold uppercase text-black/60 hover:text-black transition-colors"
                >
                  My Orders
                </Link>
              </>
            ) : (
              <Link
                href="/orders"
                className="flex items-center space-x-2 attiz-mono text-xs font-bold uppercase text-black hover:text-[#E63B2E] transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to My Orders</span>
              </Link>
            )}
          </div>

          <span className="attiz-mono text-[10px] font-bold tracking-widest text-black/40 uppercase">
            Order #{orderNo}
          </span>
        </div>

        {/* Main Order Header Card */}
        <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0_0_#111111]">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-4 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-block bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                  Order Tracking & Details
                </span>
                {isPartialCod && (
                  <span className="inline-block bg-[#E63B2E] text-white attiz-mono text-[9px] font-black uppercase tracking-widest px-2.5 py-1 shadow-[2px_2px_0_0_#111]">
                    Partial COD (Advance Paid)
                  </span>
                )}
              </div>
              <h1 className="attiz-display text-2xl sm:text-3xl uppercase text-black">
                Order #{orderNo}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 attiz-mono text-xs text-black/70 uppercase mt-1">
                {orderDate && (
                  <p>
                    Placed: <strong className="text-black">{orderDate}</strong>
                  </p>
                )}
                {order.payment_status && (
                  <p>
                    Payment: <strong className={order.payment_status === 'Paid' ? 'text-green-700' : 'text-black'}>{order.payment_status}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center sm:items-end gap-2 text-right">
              <span className="attiz-mono text-[10px] font-bold bg-[#FFCB05] border border-black px-2.5 py-1 text-black uppercase inline-block">
                {order.status || 'Confirmed'}
              </span>
              <button
                onClick={() => handlePrintInvoice(order)}
                className="inline-flex items-center space-x-1.5 attiz-mono text-xs font-bold uppercase tracking-wider px-3 py-1 border border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Bill</span>
              </button>
            </div>
          </div>

          {/* Partial COD Outstanding Balance Alert Banner (Only on Partial COD Orders) */}
          {isPartialCod && balanceAmount > 0 && (
            <div className="bg-[#FFCB05]/20 border-2 border-black p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 attiz-mono uppercase">
              <div className="flex items-center space-x-2.5">
                <Banknote className="w-5 h-5 text-[#E63B2E] shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-black/70">Partial COD Order Notice</div>
                  <div className="text-xs font-black text-black">
                    Amount Need to be Paid on Delivery:
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:self-center">
                <span className="text-base sm:text-lg font-black text-[#E63B2E] bg-white border-2 border-black px-3 py-0.5 shadow-[2px_2px_0_0_#111]">
                  ₹{balanceAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-bold text-black/60 lowercase sm:uppercase">
                  (Cash / UPI upon delivery)
                </span>
              </div>
            </div>
          )}

          {/* Expected Delivery Banner */}
          {expectedInfo && (
            <div className="bg-[#FAF8F5] border border-black/15 p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs attiz-mono uppercase">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#E63B2E] shrink-0" />
                <span className="font-bold text-black">Expected Delivery Date:</span>
                {expectedInfo.isOfficialEdd && (
                  <span className="bg-black text-[#FFCB05] text-[9px] font-bold px-1.5 py-0.5 tracking-wider">
                    Courier EDD
                  </span>
                )}
              </div>
              <span className="font-extrabold text-[#E63B2E]">
                {expectedInfo.fullDateString} ({expectedInfo.formattedDate})
              </span>
            </div>
          )}

          {/* Shipment Tracking Timeline */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="attiz-display text-sm uppercase text-black">Shipment Progress</span>
                {isAdmin && order.courier_name ? (
                  <span className="attiz-mono text-[10px] text-black/60 uppercase">
                    · {order.courier_name}
                  </span>
                ) : (
                  <span className="attiz-mono text-[10px] text-black/60 uppercase">
                    · Express Delivery
                  </span>
                )}
              </div>

              {/* On-demand "Tracking Details" Button */}
              <button
                onClick={fetchLiveTrackingDetails}
                disabled={isTrackingLoading}
                className="inline-flex items-center space-x-2 py-1.5 px-3.5 border-2 border-black bg-[#FFCB05] text-black hover:bg-black hover:text-[#FFCB05] transition-colors attiz-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-[2px_2px_0_0_#111]"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isTrackingLoading ? 'animate-spin text-[#E63B2E]' : ''}`} />
                <span>
                  {isTrackingLoading
                    ? 'Fetching Tracking...'
                    : trackingFetched
                      ? 'Refresh Tracking Details'
                      : 'Tracking Details'}
                </span>
              </button>
            </div>

            {liveTracking?.current_status && !liveTracking?.is_manual && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 attiz-mono text-[10px] font-black bg-black text-[#FFCB05] px-2.5 py-1 border border-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFCB05] animate-ping" />
                  <span>Live Courier Status: {liveTracking.current_status}</span>
                </span>
              </div>
            )}

            {/* Stepper Card */}
            <div className="p-4 sm:p-5 bg-white border border-black/15 space-y-4 shadow-xs">
              {/* Delivery Details & Tracking Links */}
              {order.tracking_url || order.awb_code ? (
                <div className="p-3 bg-[#FAF8F5] border border-black/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 attiz-mono text-xs uppercase overflow-hidden">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Truck className="w-4 h-4 text-[#E63B2E] shrink-0" />
                    <div className="min-w-0">
                      <span className="font-extrabold text-black block text-[11px] sm:text-xs">
                        {isAdmin && order.courier_name ? `${order.courier_name} Delivery` : 'Attiz Express Delivery'}
                      </span>
                      {isAdmin && order.awb_code && (
                        <span className="text-[10px] text-black/60 block lowercase">AWB: {order.awb_code}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 shrink-0">
                    {!trackingFetched && (
                      <button
                        onClick={fetchLiveTrackingDetails}
                        disabled={isTrackingLoading}
                        className="py-1.5 px-3 bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors font-bold text-[10px] sm:text-[11px] uppercase cursor-pointer"
                      >
                        {isTrackingLoading ? 'Fetching...' : 'Tracking Details'}
                      </button>
                    )}
                    {isAdmin && (
                      <a
                        href={order.tracking_url || `https://shiprocket.co/tracking/${order.awb_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 bg-[#E63B2E] text-white hover:bg-black transition-colors font-bold flex items-center gap-1.5 text-[10px] sm:text-[11px] shadow-sm cursor-pointer"
                        title="Direct Courier Tracking (Admin Only)"
                      >
                        <span>Courier Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-[#FAF8F5] border border-black/10 text-black/70 attiz-mono text-[11px] uppercase flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>Delivery Status: Dispatch In Progress</span>
                  <button
                    onClick={fetchLiveTrackingDetails}
                    disabled={isTrackingLoading}
                    className="text-black font-bold hover:text-[#E63B2E] uppercase underline cursor-pointer text-left sm:text-right"
                  >
                    {isTrackingLoading ? 'Fetching...' : 'Check Tracking Details'}
                  </button>
                </div>
              )}

              {/* Cancelled Banner or Stepper */}
              {isCancelled ? (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 attiz-mono text-xs uppercase font-bold flex items-center space-x-2">
                  <X className="w-4 h-4 shrink-0" />
                  <span>This order has been {order.status}.</span>
                </div>
              ) : (
                <div className="pt-3 pb-2 px-1 sm:px-4 w-full">
                  <div className="relative flex items-start justify-between w-full">
                    {/* Background track line: Starts at column 1 center (10%) and terminates strictly at column 5 center (90%), never extending past Delivered */}
                    <div className="absolute top-[14px] sm:top-[20px] left-[10%] right-[10%] h-[2.5px] sm:h-[3px] bg-black/10 -z-0 pointer-events-none" />
                    {/* Colored progress line: Progresses from column 1 center (10%) up to column 5 center (80% span) */}
                    <div
                      className="absolute top-[14px] sm:top-[20px] left-[10%] h-[2.5px] sm:h-[3px] bg-[#E63B2E] transition-all duration-500 ease-in-out -z-0 pointer-events-none"
                      style={{ width: `${trackProgressPct}%` }}
                    />

                    {TRACKING_STEPS.map((stepItem) => {
                      const stepNum = stepItem.id;
                      const isCompleted = stepNum < currentStep || currentStep === 5;
                      const isActive = stepNum === currentStep && currentStep !== 5;
                      const IconComponent = stepItem.icon;

                      return (
                        <div key={stepItem.key} className="flex flex-col items-center relative z-10 flex-1 px-0.5 min-w-0">
                          {/* Node Box */}
                          <div
                            className={`w-7 h-7 sm:w-10 sm:h-10 border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${isCompleted
                              ? 'bg-black border-black text-[#FFCB05]'
                              : isActive
                                ? 'bg-[#E63B2E] border-[#E63B2E] text-white shadow-md shadow-[#E63B2E]/30 scale-105'
                                : 'bg-white border-black/20 text-black/30'
                              }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[3]" />
                            ) : (
                              <IconComponent className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            )}
                          </div>

                          {/* Step Labels */}
                          <div className="mt-1.5 sm:mt-2 text-center w-full min-w-0">
                            <span
                              className={`block attiz-mono text-[7px] xs:text-[8px] sm:text-[10px] uppercase font-bold tracking-tighter sm:tracking-tight leading-tight break-words px-0.5 ${isActive
                                ? 'text-[#E63B2E] font-extrabold'
                                : isCompleted
                                  ? 'text-black'
                                  : 'text-black/30'
                                }`}
                            >
                              {stepItem.title}
                            </span>
                            <span
                              className={`block attiz-mono text-[8px] uppercase hidden sm:block ${isActive ? 'text-[#E63B2E]/80' : isCompleted ? 'text-black/60' : 'text-black/20'
                                }`}
                            >
                              {stepItem.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activity Log Checkpoints (from Shiprocket) */}
              {activities.length > 0 && (
                <div className="mt-4 pt-3 border-t border-black/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="attiz-mono text-[10px] font-bold uppercase tracking-wider text-black/70 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E63B2E]" />
                      <span>Transit History ({activities.length} Checkpoints)</span>
                    </h4>
                    {activities.length > 1 && (
                      <button
                        onClick={() => setShowAllActivities((prev) => !prev)}
                        className="attiz-mono text-[10px] font-bold text-black hover:text-[#E63B2E] uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <span>{showAllActivities ? 'Collapse' : `View All (${activities.length})`}</span>
                        {showAllActivities ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(showAllActivities ? activities : activities.slice(0, 2)).map((act: any, idx: number) => (
                      <div
                        key={idx}
                        className={`text-[11px] attiz-mono p-2.5 border flex items-start justify-between gap-2 ${
                          idx === 0
                            ? 'bg-[#FFCB05]/15 border-black font-semibold'
                            : 'bg-[#FAF8F5] border-black/10'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-black uppercase">{act.activity || act.status || 'Checkpoint'}</p>
                          {act.location && <p className="text-black/60 text-[10px] uppercase">📍 {act.location}</p>}
                        </div>
                        {act.date && (
                          <span className="text-[10px] text-black/50 shrink-0 uppercase">{act.date}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ordered Items Section */}
          <div className="space-y-3 mb-6">
            <h3 className="attiz-display text-sm uppercase text-black">
              Items in this Order ({rawItems.length})
            </h3>

            <div className="space-y-3">
              {rawItems.map((item, idx) => {
                const prodId = item.product_id || item.id;
                const colorVal = item.color || item.selectedColor;
                const unitPrice = Number(item.unit_price ?? item.price ?? 0);
                const originalPrice = Number(item.original_price ?? item.mrp ?? unitPrice);
                const itemTotal = unitPrice * Number(item.quantity || 1);

                return (
                  <div
                    key={`${item.id || idx}`}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#FAF8F5] border border-black/15 p-4"
                  >
                    {/* Item Image */}
                    <div className="sm:col-span-3 aspect-3/4 w-full max-h-40 bg-white border border-black/10 overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image && item.image !== '/placeholder.png' ? item.image : DEFAULT_IMAGE}
                        alt={item.title}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_IMAGE;
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="sm:col-span-9 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h4 className="attiz-display text-base uppercase text-black flex-1">
                          {item.title}
                        </h4>
                        <span className="attiz-mono text-sm font-extrabold text-[#E63B2E]">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {item.selectedSize && (
                          <span className="attiz-mono text-[11px] font-bold bg-black text-white px-2 py-0.5 uppercase">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {colorVal && (
                          <span className="attiz-mono text-[11px] font-bold bg-white border border-black px-2 py-0.5 text-black uppercase">
                            Color: {colorVal}
                          </span>
                        )}
                        <span className="attiz-mono text-[11px] font-bold bg-white border border-black px-2 py-0.5 text-black uppercase">
                          Qty: {item.quantity}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs attiz-mono text-black/70 uppercase">
                        <span>Unit Price: ₹{unitPrice.toLocaleString('en-IN')}</span>
                        {originalPrice > unitPrice && (
                          <span className="line-through text-black/40">₹{originalPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>

                      {/* Product page link */}
                      {prodId && (
                        <div className="pt-1">
                          <Link
                            href={`/product/${prodId}${colorVal ? `?color=${encodeURIComponent(colorVal)}` : ''}`}
                            className="inline-flex items-center space-x-1.5 py-1.5 px-3 border border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-[11px] font-bold tracking-wider uppercase cursor-pointer"
                          >
                            <span>View Product Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid of Shipping Address & Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-black/10 pt-5">
            {/* Delivery Address */}
            <div className="space-y-2">
              <h4 className="attiz-display text-xs uppercase text-black flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-black/80" />
                <span>Delivery Address</span>
              </h4>
              <div className="p-4 bg-[#FAF8F5] border border-black/15 text-xs attiz-mono space-y-1.5 uppercase text-black/80">
                {(order.shipping_name || order.customer_name) && (
                  <div className="font-bold text-black flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-black/70" />
                    <span>{order.shipping_name || order.customer_name}</span>
                  </div>
                )}
                {(order.shipping_phone || order.customer_phone) && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-black/70" />
                    <span>Phone: {order.shipping_phone || order.customer_phone}</span>
                  </div>
                )}
                <p className="pt-0.5 text-black/70 leading-relaxed">
                  {order.shipping_address1
                    ? `${order.shipping_address1}${order.shipping_address2 ? `, ${order.shipping_address2}` : ''}, ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code || ''}`
                    : order.shipping_address}
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2">
              <h4 className="attiz-display text-xs uppercase text-black flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-black/80" />
                <span>Payment Summary</span>
              </h4>
              <div className="p-4 bg-[#FAF8F5] border border-black/15 text-xs attiz-mono space-y-2 uppercase">
                <div className="flex justify-between text-black/70">
                  <span>Subtotal</span>
                  <span>₹{itemsSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#E63B2E] font-bold">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-black/70">
                  <span>Delivery Charges</span>
                  <span>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="border-t border-black/10 pt-2 flex justify-between font-extrabold text-black text-sm">
                  <span>Grand Total</span>
                  <span className="text-black">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t border-black/10 pt-2 flex justify-between text-black/60 text-[11px]">
                  <span>Payment Mode</span>
                  <span className="font-bold text-black">
                    {isPartialCod ? 'Partial COD (30% Online + 70% on Delivery)' : (order.payment_method || 'Online Payment')}
                  </span>
                </div>

                <div className="flex justify-between text-black/60 text-[11px]">
                  <span>Payment Status</span>
                  <span className={`font-bold ${order.payment_status === 'Paid' ? 'text-green-700' : 'text-black'}`}>
                    {order.payment_status || 'Pending'}
                  </span>
                </div>

                {paidAmount > 0 && (
                  <div className="flex justify-between text-black/70 text-[11px]">
                    <span>{isPartialCod ? 'Advance Paid Online (30%)' : 'Amount Paid'}</span>
                    <span className="font-bold text-black">₹{paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Amount need to be paid on delivery - ONLY ON PARTIAL COD ORDERS */}
                {isPartialCod && (
                  balanceAmount > 0 ? (
                    <div className="mt-3 p-3 bg-[#FFCB05]/20 border-2 border-black">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-black/70 block uppercase tracking-wider">
                            Due on Delivery
                          </span>
                          <span className="text-xs font-black text-black uppercase">
                            Amount Need to be Paid on Delivery
                          </span>
                        </div>
                        <span className="text-base font-black text-[#E63B2E]">
                          ₹{balanceAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 p-2.5 bg-green-50 border-2 border-green-700 text-green-900 text-[11px] font-bold flex items-center justify-between">
                      <span>Amount Paid on Delivery</span>
                      <span className="font-black">₹{Math.max(0, grandTotal - paidAmount).toLocaleString('en-IN')} (Settled)</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Customer Support Footer Note */}
          {/* <div className="mt-6 pt-4 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs attiz-mono text-black/60">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-black/40 shrink-0" />
              <span>Questions regarding this order?</span>
            </div>
            <Link
              href="/contact"
              className="font-bold text-black hover:text-[#E63B2E] underline uppercase transition-colors"
            >
              Contact ATTIZ Support
            </Link>
          </div> */}
        </div>

      </div>
    </div>
  );
}
