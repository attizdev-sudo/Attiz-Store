'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  X,
  ExternalLink,
  Phone,
  User,
  ChevronRight,
  RotateCw,
  Check,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
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

  // Default for Confirmed / Waiting for confirmation / Processing -> Step 1!
  return { step: 1, label: 'Order Confirmed', isCancelled: false };
}

function getExpectedDeliveryInfo(createdAt: string | number | Date) {
  if (!createdAt) return { fullDateString: '', formattedDate: '', dayName: '' };
  const orderDate = new Date(createdAt);
  const expectedDate = new Date(orderDate);
  expectedDate.setDate(orderDate.getDate() + 8);

  const dayName = expectedDate.toLocaleDateString('en-IN', { weekday: 'long' });
  const formattedDate = `${expectedDate.getDate()}-${expectedDate.getMonth() + 1}-${expectedDate.getFullYear()}`;
  const fullDateString = expectedDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return { dayName, formattedDate, fullDateString };
}

export default function OrdersPage() {
  const { user, sessionLoading } = useAuth();
  const { orders: allOrders } = useStore();
  const router = useRouter();

  // Selected item state for Flipkart-style popup modal
  const [selectedDetail, setSelectedDetail] = useState<{ order: any; item: CartItem } | null>(null);

  // Instant Cached Orders State
  const [localOrders, setLocalOrders] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('attiz_user_orders');
        return cached ? JSON.parse(cached) : [];
      } catch { return []; }
    }
    return [];
  });
  const [isFetchingOrders, setIsFetchingOrders] = useState(localOrders.length === 0);

  // Fetch orders directly and sync cache
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const storeUserOrders = allOrders.filter((o) => o.user_id === user.id);
      if (storeUserOrders.length > 0 && localOrders.length === 0) {
        setLocalOrders(storeUserOrders);
        setIsFetchingOrders(false);
      }

      fetch('/api/orders', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setLocalOrders(data);
            try {
              sessionStorage.setItem('attiz_user_orders', JSON.stringify(data));
            } catch { /* ignore */ }
          }
        })
        .catch((err) => console.error('Error fetching user orders:', err))
        .finally(() => setIsFetchingOrders(false));
    }
  }, [user, sessionLoading, allOrders, router]);

  const userOrders = localOrders;

  // Live Shiprocket Tracking State
  const [isTrackingLoading, setIsTrackingLoading] = useState<boolean>(false);
  const [trackingActivities, setTrackingActivities] = useState<any[]>([]);

  // Function to fetch live Shiprocket tracking status & auto-update order in database
  const refreshLiveTracking = async (orderId: string) => {
    if (!orderId) return;
    setIsTrackingLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/track`, { credentials: 'include' });
      const data = await res.json();

      if (data.success && data.order) {
        // Update order in local detail modal
        setSelectedDetail((prev) => {
          if (!prev || prev.order.id !== orderId) return prev;
          return {
            ...prev,
            order: data.order,
          };
        });

        // Sync with localOrders list
        setLocalOrders((prevOrders) => {
          const updated = prevOrders.map((o) => (o.id === orderId ? { ...o, ...data.order } : o));
          try {
            sessionStorage.setItem('attiz_user_orders', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        if (Array.isArray(data.tracking?.activities)) {
          setTrackingActivities(data.tracking.activities);
        }
      }
    } catch (err) {
      console.error('Error fetching live tracking:', err);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  // Trigger tracking fetch automatically when order modal opens
  useEffect(() => {
    if (selectedDetail?.order?.id) {
      setTrackingActivities([]);
      refreshLiveTracking(selectedDetail.order.id);
    }
  }, [selectedDetail?.order?.id]);

  // Generate printable invoice HTML for an order and open print dialog
  const generateInvoiceHtml = (order: any) => {
    const createdAt = order.created_at ? new Date(order.created_at) : new Date();
    const orderNo = order.order_number || (order.id || '').slice(0, 8).toUpperCase();
    const items = Array.isArray(order.items) ? order.items : [];

    const itemDiscountTotal = items.reduce((s: number, it: any) => {
      const qty = Number(it.quantity || 1);
      const originalUnit = Number(it.original_price ?? it.mrp ?? it.price ?? it.unit_price ?? 0);
      const finalUnit = Number(it.unit_price ?? it.price ?? 0);
      const itemDiscount = Math.max(0, originalUnit - finalUnit);
      return s + (itemDiscount * qty);
    }, 0);

    const displaySubtotal = items.reduce((s: number, it: any) => {
      const qty = Number(it.quantity || 1);
      const originalUnit = Number(it.original_price ?? it.mrp ?? it.unit_price ?? it.price ?? 0);
      const unitPrice = originalUnit > 0 ? originalUnit : Number(it.unit_price ?? it.price ?? 0);
      return s + (unitPrice * qty);
    }, 0);

    const discount = Number(itemDiscountTotal || order.discount || 0);
    const shipping = Number(order.shipping_charge || 0);
    const total = Number(order.total_price ?? order.total ?? (displaySubtotal - discount + shipping));
    const subtotal = displaySubtotal > 0 ? displaySubtotal : Math.max(0, total + discount - shipping);

    const rows = items.map((it: any) => {
      const title = it.title || it.product_title || 'Product';
      const qty = Number(it.quantity || 1);
      const originalUnit = Number(it.original_price ?? it.mrp ?? it.unit_price ?? it.price ?? 0);
      const finalUnit = Number(it.unit_price ?? it.price ?? 0);
      const displayUnitPrice = originalUnit > 0 ? originalUnit : finalUnit;
      const itemDiscount = Math.max(0, originalUnit - finalUnit);

      if (displayUnitPrice > 0 && itemDiscount > 0 && finalUnit === 0) {
        return `
          <tr>
            <td style="padding:8px;border:1px solid #222;">${title}</td>
            <td style="padding:8px;border:1px solid #222;text-align:center;">${qty}</td>
            <td style="padding:8px;border:1px solid #222;text-align:right;">₹${displayUnitPrice.toLocaleString('en-IN')}</td>
          </tr>
        `;
      }

      return `
        <tr>
          <td style="padding:8px;border:1px solid #222;">${title}</td>
          <td style="padding:8px;border:1px solid #222;text-align:center;">${qty}</td>
          <td style="padding:8px;border:1px solid #222;text-align:right;">₹${displayUnitPrice.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join('');

    const paidAmount = (() => {
      // If payment status is not Paid, customer hasn't paid anything yet
      if (order.payment_status !== 'Paid') {
        return 0;
      }
      
      // If payment status is Paid, get actual amount from payment records
      if (Array.isArray(order.payments) && order.payments.length > 0) {
        return Number(order.payments[0].amount || order.total_price || total);
      }
      
      // Fallback: use total if marked as Paid but no payment record
      return Number(order.total_price || total);
    })();

    return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice - ${orderNo}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:20px}
          .sheet{max-width:800px;margin:0 auto;border:1px solid #222;padding:20px}
          h1{font-size:20px;margin:0 0 8px}
          .muted{color:#555;font-size:13px}
          table{width:100%;border-collapse:collapse;margin-top:12px}
        </style>
      </head>
      <body>
        <div class="sheet">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <h1>ATTIZ — Tax Invoice</h1>
              <div class="muted">Order No: <strong>${orderNo}</strong></div>
              <div class="muted">Placed: ${createdAt.toLocaleString('en-IN')}</div>
            </div>
            <div style="text-align:right">
              <div class="muted">${order.shipping_name || ''}</div>
              <div class="muted">${order.shipping_phone || ''}</div>
              <div class="muted">${order.shipping_address || ''}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="padding:8px;border:1px solid #222;text-align:left;background:#f3f3f3">Item</th>
                <th style="padding:8px;border:1px solid #222;text-align:center;background:#f3f3f3">Qty</th>
                <th style="padding:8px;border:1px solid #222;text-align:right;background:#f3f3f3">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div style="margin-top:12px;display:flex;justify-content:flex-end;">
            <table style="width:320px;border-collapse:collapse">
              <tr>
                <td style="padding:6px;border:1px solid #222">Subtotal</td>
                <td style="padding:6px;border:1px solid #222;text-align:right">₹${subtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:6px;border:1px solid #222">Discount</td>
                <td style="padding:6px;border:1px solid #222;text-align:right">₹${Math.max(0, discount).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:6px;border:1px solid #222">Shipping</td>
                <td style="padding:6px;border:1px solid #222;text-align:right">₹${shipping.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:6px;border:1px solid #222;font-weight:700;background:#fafafa">Grand Total</td>
                <td style="padding:6px;border:1px solid #222;text-align:right;font-weight:700;background:#fafafa">₹${total.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding:6px;border:1px solid #222">Amount Paid</td>
                <td style="padding:6px;border:1px solid #222;text-align:right">₹${(paidAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <p style="margin-top:18px;font-size:12px;color:#555">Payment Status: <strong>${order.payment_status || 'Pending'}</strong></p>
          <p style="margin-top:6px;font-size:12px;color:#555">Thank you for shopping with ATTIZ.</p>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintInvoice = (order: any) => {
    if (!order) return;

    const html = generateInvoiceHtml(order);
    const popup = window.open('', '_blank', 'width=900,height=1100');

    if (!popup) {
      alert('Please allow popups to print the invoice.');
      return;
    }

    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      popup.location.href = blobUrl;

      setTimeout(() => {
        try {
          popup.focus();
          popup.print();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } catch (err) {
          console.error('Print error', err);
          URL.revokeObjectURL(blobUrl);
        }
      }, 600);
    } catch (err) {
      console.error('Invoice popup error', err);
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      setTimeout(() => {
        try {
          popup.focus();
          popup.print();
        } catch (printErr) {
          console.error('Print error', printErr);
        }
      }, 600);
    }
  };
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {selectedDetail ? (
          /* ========================================================================= */
          /* DEDICATED ORDER DETAILS & TRACKING PAGE VIEW                              */
          /* ========================================================================= */
          <div className="space-y-6">

            {/* Back Button */}
            <button
              onClick={() => setSelectedDetail(null)}
              className="flex items-center space-x-2 attiz-mono text-xs font-bold uppercase text-black hover:text-[#E63B2E] transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to My Orders</span>
            </button>

            {/* Page Title & Status Header Card */}
            <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0_0_#111111]">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/10 pb-4 mb-4">
                <div>
                  <span className="inline-block bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 mb-2">
                    Order Tracking & Details
                  </span>
                  <h1 className="attiz-display text-xl sm:text-2xl uppercase text-black">
                    {selectedDetail.item.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 attiz-mono text-xs text-black/70 uppercase mt-1">
                    <p>
                      Order No: <strong className="text-black">{selectedDetail.order.order_number || selectedDetail.order.id.slice(0, 8).toUpperCase()}</strong>
                    </p>
                    {selectedDetail.order.created_at && (
                      <p>
                        Ordered At: <strong className="text-black">{new Date(selectedDetail.order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex flex-col items-end gap-2">
                    <span className="attiz-mono text-[10px] font-bold bg-[#FFCB05] border border-black px-2.5 py-1 text-black uppercase inline-block">
                      {selectedDetail.order.status || 'Confirmed'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrintInvoice(selectedDetail.order); }}
                      className="attiz-mono text-xs font-bold uppercase tracking-wider px-3 py-1 border border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors"
                    >
                      Print Bill
                    </button>
                  </div>
                </div>
              </div>

              {/* Expected Delivery Banner (Order Placed Date + 8 Days) - Hidden if Delivered or Cancelled */}
              {(() => {
                const detailStatusLower = (selectedDetail.order.status || '').toLowerCase();
                const isDetailFinished = detailStatusLower === 'delivered' || detailStatusLower.includes('cancel');
                if (isDetailFinished) return null;

                const expectedInfo = getExpectedDeliveryInfo(selectedDetail.order.created_at);
                return (
                  <div className="bg-[#FAF8F5] border border-black/15 p-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs attiz-mono uppercase">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-[#E63B2E] shrink-0" />
                      <span className="font-bold text-black">Expected Delivery Date:</span>
                    </div>
                    <span className="font-extrabold text-[#E63B2E]">
                      {expectedInfo.fullDateString} ({expectedInfo.formattedDate})
                    </span>
                  </div>
                );
              })()}

              {/* Product Info Specs Card */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-[#FAF8F5] border border-black/15 p-4 mb-6">
                {/* Product Thumbnail */}
                <div className="sm:col-span-4 relative aspect-3/4 w-full bg-white border border-black/10 overflow-hidden max-h-52 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedDetail.item.image && selectedDetail.item.image !== '/placeholder.png' ? selectedDetail.item.image : DEFAULT_IMAGE}
                    alt={selectedDetail.item.title}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>

                <div className="sm:col-span-8 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedDetail.item.selectedSize && (
                      <span className="attiz-mono text-xs font-bold bg-black text-white px-2.5 py-1 uppercase">
                        Size: {selectedDetail.item.selectedSize}
                      </span>
                    )}
                    {(selectedDetail.item.color || selectedDetail.item.selectedColor) && (
                      <span className="attiz-mono text-xs font-bold bg-white border border-black px-2.5 py-1 text-black uppercase">
                        Color: {selectedDetail.item.color || selectedDetail.item.selectedColor}
                      </span>
                    )}
                    <span className="attiz-mono text-xs font-bold bg-white border border-black px-2.5 py-1 text-black uppercase">
                      Qty: {selectedDetail.item.quantity}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="attiz-mono text-xs text-black/70 uppercase block">
                      Unit Price: ₹{(selectedDetail.item.price || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="attiz-mono text-base font-extrabold text-[#E63B2E] block">
                      Item Total: ₹{((selectedDetail.item.price || 0) * selectedDetail.item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* View product page button */}
                  <button
                    onClick={() => {
                      const prodId = selectedDetail.item.product_id || selectedDetail.item.id;
                      const colorVal = selectedDetail.item.color || selectedDetail.item.selectedColor;
                      router.push(`/product/${prodId}${colorVal ? `?color=${encodeURIComponent(colorVal)}` : ''}`);
                    }}
                    className="inline-flex items-center space-x-2 py-2.5 px-4 border border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-xs font-bold tracking-wider uppercase cursor-pointer"
                  >
                    <span>View Product Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Shipment Tracking Timeline */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="attiz-display text-sm uppercase text-black">Shipment Progress</span>
                    <button
                      onClick={() => refreshLiveTracking(selectedDetail.order.id)}
                      disabled={isTrackingLoading}
                      title="Refresh live status from Shiprocket"
                      className="p-1 text-black/60 hover:text-black transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isTrackingLoading ? 'animate-spin text-[#E63B2E]' : ''}`} />
                      <span className="attiz-mono text-[9px] uppercase text-black/60 font-bold hidden sm:inline">
                        {isTrackingLoading ? 'Syncing...' : 'Live Sync'}
                      </span>
                    </button>
                  </div>
                  <span className="attiz-mono text-[10px] font-bold bg-[#FFCB05] border border-black px-2.5 py-0.5 text-black uppercase">
                    {selectedDetail.order.status || 'Confirmed'}
                  </span>
                </div>

                {/* Main Stepper Card */}
                {(() => {
                  const currentStatusInfo = getStatusStep(selectedDetail.order.status);
                  const currentStep = currentStatusInfo.step;
                  const isCancelled = currentStatusInfo.isCancelled;

                  const progressPct = isCancelled
                    ? 0
                    : Math.min(100, Math.max(0, ((currentStep - 1) / (TRACKING_STEPS.length - 1)) * 100));

                  return (
                    <div className="p-4 sm:p-5 bg-white border border-black/15 space-y-4 shadow-sm">
                      {/* Track Package Banner for Customer */}
                      {(selectedDetail.order.tracking_url || selectedDetail.order.awb_code) ? (
                        <div className="p-3 bg-[#FAF8F5] border border-black/15 flex items-center justify-between gap-2 attiz-mono text-xs uppercase">
                          <div className="flex items-center space-x-2">
                            <Truck className="w-4 h-4 text-[#E63B2E] shrink-0" />
                            <span className="font-extrabold text-black">Express Delivery Service</span>
                          </div>
                          <a
                            href={selectedDetail.order.tracking_url || `https://shiprocket.co/tracking/${selectedDetail.order.awb_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-3 bg-[#E63B2E] text-white hover:bg-black transition-colors font-bold flex items-center gap-1.5 text-[11px] shadow-sm cursor-pointer"
                          >
                            <span>Track Package</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-[#FAF8F5] border border-black/10 text-black/70 attiz-mono text-[11px] uppercase flex items-center justify-between">
                          <span>Delivery Status: Dispatch In Progress</span>
                          {isTrackingLoading && <span className="text-[#E63B2E] font-bold animate-pulse">Syncing...</span>}
                        </div>
                      )}

                      {/* Cancelled Alert Banner if applicable */}
                      {isCancelled ? (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 attiz-mono text-xs uppercase font-bold flex items-center space-x-2">
                          <X className="w-4 h-4 shrink-0" />
                          <span>This order has been {selectedDetail.order.status}.</span>
                        </div>
                      ) : (
                        /* Horizontal Connected Stepper Timeline */
                        <div className="pt-3 pb-2 px-1 sm:px-4">
                          <div className="relative flex items-center justify-between">
                            {/* Background track line */}
                            <div className="absolute top-[18px] left-[20px] right-[20px] h-[3px] bg-black/10 -z-0" />
                            {/* Colored progress fill line */}
                            <div
                              className="absolute top-[18px] left-[20px] h-[3px] bg-[#E63B2E] transition-all duration-500 ease-in-out -z-0"
                              style={{ width: `calc(${progressPct}% - ${progressPct === 100 ? 0 : 20}px)` }}
                            />

                            {TRACKING_STEPS.map((stepItem) => {
                              const stepNum = stepItem.id;
                              const isCompleted = stepNum < currentStep || currentStep === 5;
                              const isActive = stepNum === currentStep && currentStep !== 5;
                              const IconComponent = stepItem.icon;

                              return (
                                <div key={stepItem.key} className="flex flex-col items-center relative z-10 flex-1">
                                  {/* Step Circle Node */}
                                  <div
                                    className={`w-9 h-9 sm:w-10 sm:h-10 border-2 flex items-center justify-center transition-all duration-300 ${
                                      isCompleted
                                        ? 'bg-black border-black text-[#FFCB05]'
                                        : isActive
                                        ? 'bg-[#E63B2E] border-[#E63B2E] text-white shadow-md shadow-[#E63B2E]/30 scale-110'
                                        : 'bg-white border-black/20 text-black/30'
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                                    ) : (
                                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                  </div>

                                  {/* Step Titles */}
                                  <div className="mt-2 text-center">
                                    <span
                                      className={`block attiz-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-tight ${
                                        isActive
                                          ? 'text-[#E63B2E] font-extrabold'
                                          : isCompleted
                                          ? 'text-black'
                                          : 'text-black/30'
                                      }`}
                                    >
                                      {stepItem.title}
                                    </span>
                                    <span
                                      className={`block attiz-mono text-[8px] uppercase hidden sm:block ${
                                        isActive ? 'text-[#E63B2E]/80' : isCompleted ? 'text-black/60' : 'text-black/20'
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
                    </div>
                  );
                })()}
              </div>

              {/* Delivery Address & Contact info */}
              <div className="border-t border-black/10 pt-4 space-y-2">
                <h4 className="attiz-display text-xs uppercase text-black flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-black/80" />
                  <span>Delivery Address</span>
                </h4>
                <div className="p-4 bg-[#FAF8F5] border border-black/15 text-xs attiz-mono space-y-1.5 uppercase text-black/80">
                  {selectedDetail.order.shipping_name && (
                    <div className="font-bold text-black flex items-center space-x-1.5">
                      <User className="w-4 h-4 text-black/70" />
                      <span>{selectedDetail.order.shipping_name}</span>
                    </div>
                  )}
                  {selectedDetail.order.shipping_phone && (
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-4 h-4 text-black/70" />
                      <span>Phone: {selectedDetail.order.shipping_phone}</span>
                    </div>
                  )}
                  <p className="pt-0.5 text-black/70 leading-relaxed">
                    {selectedDetail.order.shipping_address1
                      ? `${selectedDetail.order.shipping_address1}${selectedDetail.order.shipping_address2 ? `, ${selectedDetail.order.shipping_address2}` : ''}, ${selectedDetail.order.shipping_city}, ${selectedDetail.order.shipping_state} ${selectedDetail.order.shipping_postal_code}`
                      : selectedDetail.order.shipping_address}
                  </p>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* ========================================================================= */
          /* ORDERS LIST VIEW                                                          */
          /* ========================================================================= */
          <>
            {/* Back button */}
            <button
              onClick={() => router.push('/')}
              className="mb-6 flex items-center space-x-2 attiz-mono text-[10px] font-bold tracking-widest text-black/70 hover:text-black transition-colors uppercase cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>

            {/* Page Header */}
            <div className="mb-6 border-b border-black/10 pb-4 flex items-center justify-between">
              <div>
                <span className="attiz-mono text-[10px] font-bold tracking-widest uppercase text-black/60 block mb-1">My Account</span>
                <h1 className="attiz-display text-2xl sm:text-3xl uppercase text-black">
                  My Orders
                </h1>
              </div>
              <span className="attiz-mono text-xs font-bold text-black/70 uppercase">
                {userOrders.length} {userOrders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>

            {/* Loading state - shown during auth check & order fetch if cache is empty */}
            {(sessionLoading || isFetchingOrders) && userOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-8 h-8 rounded-full border-3 border-black border-t-[#E63B2E] animate-spin" />
                <span className="attiz-mono text-xs font-bold tracking-widest uppercase text-black/70">
                  Loading your orders...
                </span>
              </div>

              /* Empty state */
            ) : userOrders.length === 0 ? (
              <div className="bg-white border border-black/15 p-12 text-center flex flex-col items-center justify-center space-y-4">
                <ClipboardList className="w-12 h-12 text-black/20" />
                <div>
                  <h3 className="attiz-display text-lg text-black uppercase mb-1">No Orders Found</h3>
                  <p className="attiz-mono text-xs text-black/70 uppercase">
                    You haven&apos;t placed any orders yet.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/')}
                  className="py-2.5 px-6 border border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>

              /* COMPACT ORDERS LIST */
            ) : (
              <div className="space-y-3">
                {userOrders.map((order) => {
                  const displayOrderNo = order.order_number || order.id.slice(0, 8).toUpperCase();
                  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  });

                  // Robust item extraction with fallback item if items array is empty
                  const rawItems: CartItem[] = order.items && order.items.length > 0
                    ? order.items
                    : [{
                      id: order.id,
                      product_id: order.id,
                      title: `Order #${displayOrderNo}`,
                      price: order.total_price || 0,
                      quantity: 1,
                      image: DEFAULT_IMAGE,
                    }];

                  return rawItems.map((item: CartItem, idx: number) => {
                    const statusLower = (order.status || '').toLowerCase();
                    const isDelivered = statusLower === 'delivered';
                    const isCancelled = statusLower.includes('cancel');
                    const isFinishedStatus = isDelivered || isCancelled;
                    const itemImg = item.image && item.image !== '/placeholder.png' ? item.image : DEFAULT_IMAGE;
                    const colorVal = item.color || item.selectedColor;
                    const expectedInfo = !isFinishedStatus ? getExpectedDeliveryInfo(order.created_at) : null;

                    return (
                      <div
                        key={`${order.id}-${item.id || idx}`}
                        onClick={() => setSelectedDetail({ order, item })}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedDetail({ order, item }); }}
                        className="bg-white border border-black/15 p-3.5 sm:p-4 transition-all hover:border-black hover:shadow-xs cursor-pointer group space-y-2.5"
                      >
                        {/* Header Row: Title & Total Price */}
                        <div className="flex items-start justify-between gap-3 border-b border-black/10 pb-2">
                          <h3 className="attiz-mono text-xs sm:text-sm font-bold text-black uppercase group-hover:text-[#E63B2E] transition-colors truncate flex-1">
                            {item.title}
                          </h3>

                          <div className="flex items-center space-x-2 shrink-0 text-right">
                            <div>
                              <span className="attiz-mono text-[9px] text-black/50 block uppercase leading-none">Total</span>
                              <span className="attiz-mono text-xs sm:text-sm font-bold text-black block leading-tight">
                                ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-black/40 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>

                        {/* Body Row: Thumbnail & Product Specs */}
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          {/* Product Thumbnail */}
                          <div className="relative w-14 h-16 sm:w-16 sm:h-20 bg-[#FAF8F5] border border-black/10 shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={itemImg}
                              alt={item.title}
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_IMAGE;
                              }}
                            />
                          </div>

                          {/* Variant Badges & Status Details */}
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] attiz-mono text-black/70">
                              {item.selectedSize && (
                                <span className="bg-black text-white px-1.5 py-0.5 font-bold uppercase">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              {colorVal && (
                                <span className="bg-black/10 text-black px-1.5 py-0.5 font-bold uppercase">
                                  Color: {colorVal}
                                </span>
                              )}
                              <span className="font-semibold text-black/70">Qty: {item.quantity}</span>
                            </div>

                            {/* Status Indicator */}
                            <div className="flex items-center space-x-1.5 text-[11px] attiz-mono uppercase pt-0.5">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isCancelled
                                    ? 'bg-red-600'
                                    : isDelivered
                                    ? 'bg-green-600'
                                    : 'bg-[#E63B2E] animate-pulse'
                                }`}
                              />
                              <span
                                className={`font-bold ${
                                  isCancelled
                                    ? 'text-red-600'
                                    : isDelivered
                                    ? 'text-green-700'
                                    : 'text-[#E63B2E]'
                                }`}
                              >
                                {order.status || 'Order Placed'}
                              </span>
                              <span className="text-black/40 text-[10px]">· {orderDate}</span>
                            </div>

                            {/* Expected Delivery Line (Hidden if Delivered or Cancelled) */}
                            {expectedInfo && (
                              <div className="text-[10px] sm:text-[11px] attiz-mono text-black/80 uppercase pt-0.5 flex items-center space-x-1">
                                <Truck className="w-3.5 h-3.5 text-[#E63B2E] shrink-0" />
                                <span>Expected: <strong className="text-black font-extrabold">{expectedInfo.fullDateString}</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
