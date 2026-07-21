'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList, Clock, CheckCircle2, Package, Truck, MapPin, Hash, CalendarDays, ReceiptText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';

type StatusKey = 'Waiting for confirmation' | 'Accepted' | 'Dispatched' | 'Shipped' | 'Delivered' | string;

const STATUS_CONFIG: Record<string, {
  bg: string;
  text: string;
  border: string;
  shadow: string;
  icon: React.ReactNode;
  step: number;
}> = {
  'Waiting for confirmation': {
    bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', shadow: 'shadow-[3px_3px_0_0_#f97316]',
    icon: <Clock className="w-3.5 h-3.5 animate-pulse" />, step: 1,
  },
  'Accepted': {
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', shadow: 'shadow-[3px_3px_0_0_#3b82f6]',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />, step: 2,
  },
  'Dispatched': {
    bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', shadow: 'shadow-[3px_3px_0_0_#6366f1]',
    icon: <Package className="w-3.5 h-3.5" />, step: 3,
  },
  'Shipped': {
    bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', shadow: 'shadow-[3px_3px_0_0_#a855f7]',
    icon: <Truck className="w-3.5 h-3.5" />, step: 4,
  },
  'Delivered': {
    bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', shadow: 'shadow-[3px_3px_0_0_#22c55e]',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />, step: 5,
  },
};

const STEPS = ['Confirmed', 'Accepted', 'Dispatched', 'Shipped', 'Delivered'];

function getStatusConfig(status: StatusKey) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG['Delivered'];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders: allOrders, dbLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const userOrders = allOrders.filter((o) => o.user_id === user?.id);

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-hidden">
      {/* Halftone texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] z-0"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">

        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="mb-10 flex items-center space-x-2 attiz-mono text-[10px] font-bold tracking-widest text-black/85 hover:text-black transition-colors uppercase cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Home</span>
        </button>

        {/* Page Header */}
        <div className="mb-10 sm:mb-12">
          <span className="inline-flex items-center bg-black text-[#FFCB05] attiz-mono text-[9px] font-bold tracking-[0.3em] uppercase px-3 py-1 -skew-x-6 border-2 border-black mb-4">
            <span className="skew-x-6">My Account</span>
          </span>
          <h1 className="attiz-display text-3xl sm:text-4xl md:text-5xl uppercase leading-[0.95] tracking-tight text-black mb-3">
            Track Orders
          </h1>
          <p className="attiz-mono text-[10px] font-bold tracking-[0.25em] text-black/85 uppercase">
            {userOrders.length > 0
              ? `${userOrders.length} order${userOrders.length > 1 ? 's' : ''} placed`
              : 'Your order history'}
          </p>
        </div>

        {/* Loading state */}
        {dbLoading ? (
          <div className="flex flex-col items-center justify-center py-28 space-y-4">
            <div className="w-9 h-9 rounded-full border-[3px] border-black border-t-[#E63B2E] animate-spin" />
            <span className="attiz-mono text-[10px] font-bold tracking-[0.35em] uppercase text-black/85">
              Loading your orders…
            </span>
          </div>

        /* Empty state */
        ) : userOrders.length === 0 ? (
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0_0_#111111] p-14 flex flex-col items-center text-center space-y-5">
            <ClipboardList className="w-14 h-14 text-black/15 stroke-[1.2]" />
            <div>
              <h3 className="attiz-display text-xl text-black uppercase mb-1">No Orders Yet</h3>
              <p className="attiz-mono text-[10px] font-bold tracking-widest text-black/85 uppercase leading-relaxed">
                You haven&apos;t placed any orders yet.<br />Start shopping to see them here.
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="mt-2 px-8 py-3 border-[3px] border-black attiz-display text-xs tracking-[0.15em] uppercase bg-black text-[#FFCB05] shadow-[4px_4px_0_0_#E63B2E] hover:bg-white hover:text-black hover:shadow-[2px_2px_0_0_#111111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
            >
              Start Shopping
            </button>
          </div>

        /* Orders list */
        ) : (
          <div className="space-y-10">
            {userOrders.map((order) => {
              const cfg = getStatusConfig(order.status);
              const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric',
              });
              const total = order.total_price.toLocaleString('en-IN');

              return (
                <div
                  key={order.id}
                  className="bg-white border-[3px] border-black shadow-[6px_6px_0_0_#111111] overflow-hidden"
                >
                  {/* ── Order Header ── */}
                  <div className="bg-[#111111] px-4 sm:px-5 py-4">
                    {/* Row 1: ID + Date */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      {/* Order ID */}
                      <div className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-[#FFCB05]" />
                        <div>
                          <span className="block attiz-mono text-[8px] font-bold text-white/40 tracking-widest uppercase">Order ID</span>
                          <span className="attiz-mono text-xs font-bold text-white uppercase">{order.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                      </div>
                      {/* Date */}
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-[#FFCB05]" />
                        <div>
                          <span className="block attiz-mono text-[8px] font-bold text-white/40 tracking-widest uppercase">Date Placed</span>
                          <span className="attiz-mono text-xs font-bold text-white">{orderDate}</span>
                        </div>
                      </div>
                    </div>
                    {/* Row 2: Status badge */}
                    <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 border-2 ${cfg.bg} ${cfg.text} ${cfg.border} ${cfg.shadow} attiz-mono text-[9px] font-bold tracking-wider uppercase`}>
                      {cfg.icon}
                      <span>{order.status || 'Confirmed'}</span>
                    </div>
                  </div>

                  {/* ── Progress tracker ── */}
                  <div className="px-4 sm:px-5 py-5 border-b-2 border-black/10 bg-[#FAF8F5]">
                    <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                      <div className="flex items-center justify-between gap-1 relative min-w-[280px]">
                        {/* Track line */}
                        <div className="absolute left-0 right-0 top-[14px] h-[2px] bg-black/10 z-0" />
                        <div
                          className="absolute left-0 top-[14px] h-[2px] bg-[#E63B2E] z-0 transition-all duration-700"
                          style={{ width: `${Math.max(0, ((cfg.step - 1) / (STEPS.length - 1)) * 100)}%` }}
                        />
                        {STEPS.map((step, i) => {
                          const done = i < cfg.step;
                          const active = i === cfg.step - 1;
                          return (
                            <div key={step} className="flex flex-col items-center z-10 flex-1">
                              <div className={`w-7 h-7 border-2 flex items-center justify-center text-[9px] font-bold transition-all ${
                                active
                                  ? 'bg-[#E63B2E] border-[#E63B2E] text-white shadow-[2px_2px_0_0_#111]'
                                  : done
                                    ? 'bg-black border-black text-[#FFCB05]'
                                    : 'bg-white border-black/20 text-black/30'
                              }`}>
                                {done && !active ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <span className="attiz-mono">{i + 1}</span>
                                )}
                              </div>
                              <span className={`mt-1.5 attiz-mono text-[7px] font-bold tracking-wider uppercase text-center leading-tight max-w-[48px] ${
                                active ? 'text-[#E63B2E]' : done ? 'text-black' : 'text-black/25'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── Order Items ── */}
                  <div className="divide-y-2 divide-black/5 px-4 sm:px-5">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-start sm:items-center justify-between py-4 gap-3">
                        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          {/* Product image */}
                          <div className="relative w-12 h-14 sm:w-14 sm:h-16 bg-[#FAF8F5] border-2 border-black shrink-0 overflow-hidden">
                            <Image src={item.image} alt={item.title} fill className="object-cover" sizes="56px" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="attiz-display text-xs sm:text-sm text-black uppercase leading-tight line-clamp-2 mb-0.5">
                              {item.title}
                            </h4>
                            <span className="attiz-mono text-[9px] font-bold text-black/85 tracking-widest uppercase">
                              Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <span className="attiz-display text-sm text-black shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ── Footer: Address + Total ── */}
                  <div className="px-5 py-4 border-t-[3px] border-black bg-[#FAF8F5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {/* Address */}
                    <div className="flex items-start gap-2 max-w-sm">
                      <MapPin className="w-3.5 h-3.5 text-black/40 mt-0.5 shrink-0" />
                      <div>
                        <span className="block attiz-mono text-[8px] font-bold text-black/85 tracking-widest uppercase mb-0.5">Shipping To</span>
                        <p className="attiz-body text-[12px] text-black/65 leading-relaxed tracking-wide">{order.shipping_address}</p>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="shrink-0 text-right sm:text-right">
                      <span className="block attiz-mono text-[8px] font-bold text-black/35 tracking-widest uppercase mb-0.5">
                        <ReceiptText className="inline w-3 h-3 mr-1 mb-0.5" />
                        Order Total
                      </span>
                      <div className="relative inline-block">
                        <span className="absolute inset-x-0 bottom-0.5 h-[40%] bg-[#FFCB05] -rotate-1 -z-0" />
                        <span className="relative z-10 attiz-display text-xl text-black px-1">₹{total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
