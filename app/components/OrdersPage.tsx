'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ClipboardList,
  Truck,
  ChevronRight,
  Printer,
  Package,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { handlePrintInvoice } from '@/lib/invoice';
import { getExpectedDeliveryInfo } from '@/lib/orders';
import AttizLoader from '@/app/components/AttizLoader';
import type { CartItem } from '@/lib/types';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';

export default function OrdersPage() {
  const { user, sessionLoading } = useAuth();
  const { orders: allOrders } = useStore();
  const router = useRouter();

  // Loading state when an order container is clicked
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const handleOpenOrder = (orderId: string) => {
    if (navigatingId) return;
    setNavigatingId(orderId);
    router.push(`/orders/${orderId}`);
  };

  // Instant Cached Orders State
  const [localOrders, setLocalOrders] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('attiz_user_orders');
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isFetchingOrders, setIsFetchingOrders] = useState(localOrders.length === 0);

  // Fetch orders directly and sync cache
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push('/login?redirect=/orders');
      return;
    }

    if (user) {
      const initialOrders = user.role === 'admin' ? allOrders : allOrders.filter((o) => o.user_id === user.id);
      if (initialOrders.length > 0 && localOrders.length === 0) {
        setLocalOrders(initialOrders);
        setIsFetchingOrders(false);
      }

      fetch('/api/orders', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setLocalOrders(data);
            try {
              sessionStorage.setItem('attiz_user_orders', JSON.stringify(data));
            } catch {
              /* ignore */
            }
          }
        })
        .catch((err) => console.error('Error fetching user orders:', err))
        .finally(() => setIsFetchingOrders(false));
    }
  }, [user, sessionLoading, allOrders, router, localOrders.length]);

  const userOrders = localOrders;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center space-x-2 attiz-mono text-[10px] font-bold tracking-widest text-black/70 hover:text-black transition-colors uppercase cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="mb-6 border-b border-black/10 pb-4 flex items-center justify-between">
          <div>
            <span className="attiz-mono text-[10px] font-bold tracking-widest uppercase text-black/60 block mb-1">
              My Account
            </span>
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
          <div className="py-20 flex items-center justify-center">
            <AttizLoader label="Loading your orders..." badge="ORDERS" />
          </div>
        ) : userOrders.length === 0 ? (
          /* Empty state */
          <div className="bg-white border-2 border-black p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-[4px_4px_0_0_#111111]">
            <ClipboardList className="w-12 h-12 text-black/20" />
            <div>
              <h3 className="attiz-display text-lg text-black uppercase mb-1">No Orders Found</h3>
              <p className="attiz-mono text-xs text-black/70 uppercase">
                You haven&apos;t placed any orders yet.
              </p>
            </div>
            <Link
              href="/"
              className="py-2.5 px-6 border-2 border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* ORDERS LIST VIEW */
          <div className="space-y-4">
            {userOrders.map((order) => {
              const displayOrderNo = order.order_number || order.id.slice(0, 8).toUpperCase();
              const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              // Extract order items
              const rawItems: CartItem[] =
                order.items && order.items.length > 0
                  ? order.items
                  : [
                      {
                        id: order.id,
                        product_id: order.id,
                        title: `Order #${displayOrderNo}`,
                        price: order.total_price || 0,
                        quantity: 1,
                        image: DEFAULT_IMAGE,
                      },
                    ];

              const statusLower = (order.status || '').toLowerCase();
              const isDelivered = statusLower === 'delivered';
              const isCancelled = statusLower.includes('cancel');
              const isFinishedStatus = isDelivered || isCancelled;
              const expectedInfo = !isFinishedStatus ? getExpectedDeliveryInfo(order.created_at, order.edd) : null;

              const paidAmount = Number(order.payments?.[0]?.amount || order.paid_amount || 0);
              const isPartialCod = order.payment_status === 'Pending' && paidAmount > 0;
              const balanceAmount = isPartialCod ? Math.max(0, Number(order.total_price || 0) - paidAmount) : 0;

              return (
                <div
                  key={order.id}
                  className="relative bg-white border-2 border-black shadow-[3px_3px_0_0_#111111] hover:shadow-[5px_5px_0_0_#111111] transition-all overflow-hidden"
                >
                  {/* Immediate Loading Overlay when clicked */}
                  {navigatingId === order.id && (
                    <div className="absolute inset-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-[2px] flex items-center justify-center p-6 animate-in fade-in duration-150">
                      <AttizLoader label="Loading Order Details..." />
                    </div>
                  )}

                  {/* Order Card Top Bar */}
                  <div className="bg-[#FAF8F5] border-b border-black/10 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 attiz-mono text-xs uppercase">
                      <span className="font-extrabold text-black">
                        Order #{displayOrderNo}
                      </span>
                      <span className="text-black/50">· {orderDate}</span>
                      {isPartialCod && (
                        <span className="bg-[#E63B2E] text-white text-[9px] font-black px-1.5 py-0.5 tracking-wider uppercase">
                          Partial COD
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="attiz-mono text-[10px] font-bold bg-[#FFCB05] border border-black px-2 py-0.5 text-black uppercase">
                        {order.status || 'Confirmed'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintInvoice(order);
                        }}
                        title="Print Invoice"
                        className="p-1 text-black/60 hover:text-black transition-colors border border-black/20 hover:border-black bg-white cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Order Items List in this Card */}
                  <div className="divide-y divide-black/5">
                    {rawItems.map((item: CartItem, idx: number) => {
                      const itemImg =
                        item.image && item.image !== '/placeholder.png' ? item.image : DEFAULT_IMAGE;
                      const colorVal = item.color || item.selectedColor;

                      return (
                        <div
                          key={`${order.id}-${item.id || idx}`}
                          onClick={() => handleOpenOrder(order.id)}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleOpenOrder(order.id);
                            }
                          }}
                          className="p-3.5 sm:p-4 hover:bg-black/[0.02] transition-colors cursor-pointer group flex items-start space-x-3 sm:space-x-4"
                        >
                          {/* Product Thumbnail */}
                          <div className="relative w-14 h-16 sm:w-16 sm:h-20 bg-[#FAF8F5] border border-black/10 shrink-0 overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center">
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

                          {/* Item Details */}
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="attiz-mono text-xs sm:text-sm font-bold text-black uppercase group-hover:text-[#E63B2E] transition-colors truncate flex-1">
                                {item.title}
                              </h3>
                              <span className="attiz-mono text-xs sm:text-sm font-bold text-black shrink-0">
                                ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                              </span>
                            </div>

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
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-black/40 group-hover:text-black group-hover:translate-x-0.5 transition-all self-center shrink-0" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Footer Bar: Expected Delivery & Direct Link to Details */}
                  <div className="bg-[#FAF8F5] border-t border-black/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 attiz-mono text-xs uppercase">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {expectedInfo ? (
                        <div className="flex items-center space-x-1.5 text-[11px] text-black/80">
                          <Truck className="w-3.5 h-3.5 text-[#E63B2E] shrink-0" />
                          <span>
                            Expected: <strong className="text-black font-extrabold">{expectedInfo.formattedDate}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-[11px] text-black/60">
                          <Package className="w-3.5 h-3.5 shrink-0" />
                          <span>Total: ₹{Number(order.total_price || 0).toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {/* Display amount need to be paid on delivery - only on partial COD orders */}
                      {isPartialCod && balanceAmount > 0 && (
                        <span className="inline-flex items-center space-x-1 bg-[#FFCB05] text-black border border-black px-2 py-0.5 text-[10px] font-black uppercase">
                          <span>Due on Delivery:</span>
                          <span className="text-[#E63B2E]">₹{balanceAmount.toLocaleString('en-IN')}</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenOrder(order.id)}
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-black hover:text-[#E63B2E] uppercase transition-colors cursor-pointer"
                    >
                      <span>View Details & Tracking</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Instant Navigation Loader Overlay */}
        {navigatingId && (
          <div className="fixed inset-0 z-50 bg-[#FAF8F5]/85 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-150">
            <div className="bg-white border-2 border-black p-8 shadow-[6px_6px_0_0_#111111] max-w-xs w-full mx-4">
              <AttizLoader label="Loading Order Details..." />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
