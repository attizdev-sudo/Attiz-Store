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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import type { CartItem } from '@/lib/types';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600';

type StatusKey = 'Waiting for confirmation' | 'Accepted' | 'Dispatched' | 'Shipped' | 'Delivered' | string;

const STATUS_CONFIG: Record<string, {
  bg: string;
  text: string;
  border: string;
  icon: React.ReactNode;
  step: number;
}> = {
  'Waiting for confirmation': {
    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200',
    icon: <Clock className="w-3.5 h-3.5 animate-pulse" />, step: 1,
  },
  'Accepted': {
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />, step: 2,
  },
  'Dispatched': {
    bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200',
    icon: <Package className="w-3.5 h-3.5" />, step: 3,
  },
  'Shipped': {
    bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200',
    icon: <Truck className="w-3.5 h-3.5" />, step: 4,
  },
  'Delivered': {
    bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />, step: 5,
  },
};

const STEPS = ['Confirmed', 'Accepted', 'Dispatched', 'Shipped', 'Delivered'];

function getStatusConfig(status: StatusKey) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG['Delivered'];
}

export default function OrdersPage() {
  const { user, sessionLoading } = useAuth();
  const { orders: allOrders, dbLoading } = useStore();
  const router = useRouter();

  // Selected item state for Flipkart-style popup modal
  const [selectedDetail, setSelectedDetail] = useState<{ order: any; item: CartItem } | null>(null);

  // FIX: Only redirect after session loading completes
  useEffect(() => {
    if (!sessionLoading && !user) {
      router.push('/login');
    }
  }, [user, sessionLoading, router]);

  const userOrders = allOrders.filter((o) => o.user_id === user?.id);

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

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

        {/* Loading state - waits for both session & DB loading */}
        {sessionLoading || dbLoading ? (
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

        /* FLIPKART-STYLE COMPACT ORDERS LIST */
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
                const isDelivered = order.status === 'Delivered';
                const itemImg = item.image && item.image !== '/placeholder.png' ? item.image : DEFAULT_IMAGE;
                const colorVal = item.color || item.selectedColor;

                return (
                  <div
                    key={`${order.id}-${item.id || idx}`}
                    onClick={() => setSelectedDetail({ order, item })}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedDetail({ order, item }); }}
                    className="bg-white border border-black/15 p-3.5 sm:p-4 transition-all hover:border-black hover:shadow-xs cursor-pointer group flex items-center justify-between gap-4"
                  >
                    {/* Left: Product Thumbnail & Title Info */}
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                      {/* Product Thumbnail with onError Fallback */}
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

                      {/* Title & Variant Details */}
                      <div className="min-w-0">
                        <h3 className="attiz-mono text-xs sm:text-sm font-bold text-black uppercase truncate group-hover:text-[#E63B2E] transition-colors mb-1">
                          {item.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] attiz-mono text-black/70 mb-1.5">
                          {item.selectedSize && (
                            <span className="bg-black text-white px-1.5 py-0.2 font-bold uppercase">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {colorVal && (
                            <span className="bg-black/10 px-1.5 py-0.2 font-bold text-black uppercase">
                              Color: {colorVal}
                            </span>
                          )}
                          <span>Qty: {item.quantity}</span>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex items-center space-x-1.5 text-[11px] attiz-mono uppercase">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isDelivered ? 'bg-green-600' : 'bg-[#E63B2E] animate-pulse'}`} />
                          <span className={`font-bold ${isDelivered ? 'text-green-700' : 'text-[#E63B2E]'}`}>
                            {order.status || 'Order Placed'}
                          </span>
                          <span className="text-black/40 hidden sm:inline">· {orderDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Chevron Navigation Indicator */}
                    <div className="flex items-center space-x-3 shrink-0 text-right">
                      <div>
                        <span className="attiz-mono text-[9px] text-black/50 block uppercase">Total</span>
                        <span className="attiz-mono text-xs sm:text-sm font-bold text-black block">
                          ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-black/40 group-hover:text-black group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              });
            })}
          </div>
        )}

      </div>

      {/* DETAILED ORDER & TRACKING MODAL */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-black p-5 sm:p-7 max-w-xl w-full relative shadow-xl my-8">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedDetail(null)}
              className="absolute top-4 right-4 text-black hover:text-[#E63B2E] p-1.5 border border-black/20 bg-white hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="border-b border-black/10 pb-3 mb-5 pr-8">
              <span className="inline-block bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 mb-1.5">
                Order Tracking & Details
              </span>
              <h2 className="attiz-display text-lg sm:text-xl uppercase text-black">
                {selectedDetail.item.title}
              </h2>
              <span className="attiz-mono text-xs text-black/70 uppercase">
                Order No: <strong className="text-black">{selectedDetail.order.order_number || selectedDetail.order.id.slice(0, 8).toUpperCase()}</strong>
              </span>
            </div>

            {/* Product Image & Specs Card */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#FAF8F5] border border-black/15 p-3.5 mb-5">
              {/* Product Thumbnail with onError Fallback */}
              <div className="sm:col-span-4 relative aspect-3/4 w-full bg-white border border-black/10 overflow-hidden max-h-48 flex items-center justify-center">
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

              <div className="sm:col-span-8 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedDetail.item.selectedSize && (
                    <span className="attiz-mono text-xs font-bold bg-black text-white px-2 py-0.5 uppercase">
                      Size: {selectedDetail.item.selectedSize}
                    </span>
                  )}
                  {(selectedDetail.item.color || selectedDetail.item.selectedColor) && (
                    <span className="attiz-mono text-xs font-bold bg-white border border-black/20 px-2 py-0.5 text-black uppercase">
                      Color: {selectedDetail.item.color || selectedDetail.item.selectedColor}
                    </span>
                  )}
                  <span className="attiz-mono text-xs font-bold bg-white border border-black/20 px-2 py-0.5 text-black uppercase">
                    Qty: {selectedDetail.item.quantity}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="attiz-mono text-xs text-black/70 uppercase block">
                    Unit Price: ₹{selectedDetail.item.price.toLocaleString('en-IN')}
                  </span>
                  <span className="attiz-mono text-sm font-extrabold text-[#E63B2E] block">
                    Item Total: ₹{(selectedDetail.item.price * selectedDetail.item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Button to view full product page with color pre-selected */}
                <button
                  onClick={() => {
                    const prodId = selectedDetail.item.product_id || selectedDetail.item.id;
                    const colorVal = selectedDetail.item.color || selectedDetail.item.selectedColor;
                    setSelectedDetail(null);
                    router.push(`/product/${prodId}${colorVal ? `?color=${encodeURIComponent(colorVal)}` : ''}`);
                  }}
                  className="inline-flex items-center space-x-1.5 py-2 px-3 border border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-[11px] font-bold tracking-wider uppercase cursor-pointer"
                >
                  <span>View Product Page</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Shipment Tracking Timeline */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <span className="attiz-display text-xs uppercase text-black">Shipment Progress</span>
                <span className="attiz-mono text-[10px] font-bold bg-[#FFCB05] border border-black px-2 py-0.5 text-black uppercase">
                  {selectedDetail.order.status || 'Confirmed'}
                </span>
              </div>

              {/* Multi-step Tracking Graph */}
              <div className="p-3 bg-white border border-black/15">
                <div className="flex items-center justify-between gap-1 relative">
                  {STEPS.map((step, i) => {
                    const cfg = getStatusConfig(selectedDetail.order.status);
                    const done = i < cfg.step;
                    const active = i === cfg.step - 1;
                    return (
                      <div key={step} className="flex flex-col items-center z-10 flex-1">
                        <div
                          className={`w-6 h-6 border flex items-center justify-center text-[8px] font-bold transition-all ${
                            active
                              ? 'bg-[#E63B2E] border-[#E63B2E] text-white'
                              : done
                              ? 'bg-black border-black text-[#FFCB05]'
                              : 'bg-white border-black/20 text-black/30'
                          }`}
                        >
                          {done && !active ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <span className="attiz-mono">{i + 1}</span>
                          )}
                        </div>
                        <span
                          className={`mt-1 attiz-mono text-[7px] font-bold uppercase text-center ${
                            active ? 'text-[#E63B2E]' : done ? 'text-[#111111]' : 'text-black/30'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Delivery Address & Contact info */}
            <div className="border-t border-black/10 pt-3 space-y-2">
              <h4 className="attiz-display text-xs uppercase text-black flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-black/80" />
                <span>Delivery Address</span>
              </h4>
              <div className="p-3 bg-[#FAF8F5] border border-black/10 text-xs attiz-mono space-y-1 uppercase text-black/80">
                {selectedDetail.order.shipping_name && (
                  <div className="font-bold text-black flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-black/70" />
                    <span>{selectedDetail.order.shipping_name}</span>
                  </div>
                )}
                {selectedDetail.order.shipping_phone && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-black/70" />
                    <span>Phone: {selectedDetail.order.shipping_phone}</span>
                  </div>
                )}
                <p className="pt-0.5 text-black/70">
                  {selectedDetail.order.shipping_address1
                    ? `${selectedDetail.order.shipping_address1}${selectedDetail.order.shipping_address2 ? `, ${selectedDetail.order.shipping_address2}` : ''}, ${selectedDetail.order.shipping_city}, ${selectedDetail.order.shipping_state} ${selectedDetail.order.shipping_postal_code}`
                    : selectedDetail.order.shipping_address}
                </p>
              </div>
            </div>

            {/* Footer button */}
            <div className="mt-5 pt-3 border-t border-black/10 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
                className="py-2 px-5 border border-black bg-black text-[#FFCB05] hover:bg-[#E63B2E] hover:text-white transition-colors attiz-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
